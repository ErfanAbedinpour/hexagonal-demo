# Comprehensive Guide to Hexagonal + Clean Architecture in NestJS

## Understanding Each Architectural Component

---

## Table of Contents

1. [Domain Layer Components](#domain-layer-components)
2. [Application Layer Components](#application-layer-components)
3. [Infrastructure Layer Components](#infrastructure-layer-components)
4. [API Layer Components](#api-layer-components)
5. [Cross-Cutting Components](#cross-cutting-components)
6. [Flow of Dependencies](#flow-of-dependencies)
7. [Common Anti-Patterns to Avoid](#common-anti-patterns-to-avoid)

---

## Domain Layer Components

The **Domain Layer** is the innermost circle of Clean Architecture. It contains enterprise-wide business rules and is completely independent of any external concerns like databases, APIs, or frameworks.

### 1. Entities

**What are Entities?**  
Entities are objects that have a distinct identity that persists over time. They represent core business concepts and contain business logic that operates on their properties.

**Key Characteristics:**

- Have a unique identifier (ID) that remains constant even if other attributes change
- Contain business rules and validation logic
- Can change state through methods (behavior)
- Are mutable within business rules
- Do NOT depend on any external layer

**Real-world Example:**

```typescript
// src/domain/entities/order.entity.ts

/**
 * WHY THIS IS AN ENTITY:
 * - An Order has a unique identity (OrderId) that remains the same
 * - The order status can change from DRAFT → PLACED → SHIPPED
 * - Even if the total amount changes, it's still the same order
 * - Contains business logic like "can't add items to shipped order"
 */
export class Order extends AggregateRoot<OrderId> {
  private _items: OrderItem[] = [];
  private _status: OrderStatus;
  private _total: Money;

  // Business rule: Cannot add items to shipped order
  public addItem(productId: string, quantity: number, unitPrice: Money): void {
    if (this._status.isShipped()) {
      throw new Error('Cannot add items to shipped order');
    }
    // Business logic here...
  }

  // Business rule: Order needs at least one item to be placed
  public place(): void {
    if (this._items.length === 0) {
      throw new Error('Cannot place order without items');
    }
    this._status = new OrderStatus(OrderStatusEnum.PLACED);
  }
}

/**
 * NAMING CONVENTION:
 * - Use noun names (Order, Product, Customer)
 * - Suffix with 'Entity' only if needed to distinguish from DTOs
 * - Be specific: PremiumCustomer, PhysicalProduct, DigitalProduct
 */
```

**When to Create an Entity vs Value Object:**
| **Use Entity When** | **Use Value Object When** |
|-------------------|--------------------------|
| Object has a unique identity | Object is defined by its attributes |
| Object can change over time | Object is immutable |
| You need to track its history | Object can be replaced entirely |
| Example: Order, Customer, Product | Example: Money, Address, Color |

### 2. Value Objects (VOs)

**What are Value Objects?**  
Value objects are immutable objects whose equality is based on their attribute values, not on an identity.

**Key Characteristics:**

- No identity - two VOs with same values are considered equal
- Immutable - cannot be changed after creation
- Self-validating - validate their state upon creation
- Behavior-rich - can contain methods that return new instances
- Replaceable - to change a VO, create a new one

**Real-world Example:**

```typescript
// src/domain/value-objects/money.vo.ts

/**
 * WHY THIS IS A VALUE OBJECT:
 * - $10 USD is $10 USD regardless of "which" $10 USD it is
 * - Two Money objects with same amount/currency are interchangeable
 * - Money should be immutable (you don't change $10 to $15, you create new)
 * - Contains domain logic about currency operations
 */
export class Money {
  private constructor(
    private readonly _amount: number,
    private readonly _currency: string,
  ) {
    this.validate();
  }

  private validate(): void {
    if (this._amount < 0) {
      throw new Error('Money amount cannot be negative');
    }
    if (!this._currency || this._currency.length !== 3) {
      throw new Error('Currency must be a valid ISO 4217 code');
    }
  }

  // Factory method instead of direct constructor
  public static create(amount: number, currency: string): Money {
    return new Money(amount, currency);
  }

  // Returns NEW Money instance - doesn't modify existing
  public add(other: Money): Money {
    if (this._currency !== other._currency) {
      throw new Error('Cannot add different currencies');
    }
    return new Money(this._amount + other._amount, this._currency);
  }

  // Value-based equality, not identity-based
  public equals(other: Money): boolean {
    return this._amount === other._amount && this._currency === other._currency;
  }

  get amount(): number {
    return this._amount;
  }
  get currency(): string {
    return this._currency;
  }
}

// src/domain/value-objects/address.vo.ts
export class Address {
  private constructor(
    private readonly _street: string,
    private readonly _city: string,
    private readonly _postalCode: string,
    private readonly _country: string,
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this._street || this._street.length < 3) {
      throw new Error(
        'Street address is required and must be at least 3 characters',
      );
    }
    if (!this._country || this._country.length !== 2) {
      throw new Error('Country must be a valid 2-letter ISO code');
    }
    // More validation...
  }

  public static create(
    street: string,
    city: string,
    postalCode: string,
    country: string,
  ): Address {
    return new Address(street, city, postalCode, country);
  }

  // Behavior - format address for shipping label
  public formatForShippingLabel(): string {
    return `${this._street}\n${this._city}, ${this._postalCode}\n${this._country}`;
  }

  // Immutable - returns new instance
  public withStreet(newStreet: string): Address {
    return new Address(newStreet, this._city, this._postalCode, this._country);
  }
}
```

**Common Value Objects Examples:**

- Money (amount + currency)
- DateRange (startDate + endDate)
- EmailAddress (with validation)
- PhoneNumber (with formatting)
- Coordinates (latitude + longitude)

### 3. Aggregates

**What are Aggregates?**  
An aggregate is a cluster of domain objects (entities and value objects) that can be treated as a single unit. The aggregate root is the only entry point for accessing members of the aggregate.

**Key Characteristics:**

- Has an aggregate root (one entity that acts as the entry point)
- Maintains consistency boundaries (transactional boundaries)
- Ensures invariants (business rules) across all members
- References to other aggregates should be by ID, not by object reference
- Changes to aggregate happen ONLY through the aggregate root

**Real-world Example:**

```typescript
// src/domain/aggregates/order-aggregate.ts

/**
 * WHY THIS IS AN AGGREGATE:
 * - Order is the AGGREGATE ROOT (entry point)
 * - OrderItems cannot exist without an Order (consistency boundary)
 * - Business rules span multiple items (total calculation, minimum items)
 * - All changes to OrderItems must go through the Order root
 * - When Order is saved, all OrderItems are saved together (transactional)
 */
export class Order extends AggregateRoot<OrderId> {
  private _items: OrderItem[] = []; // Part of aggregate
  private _status: OrderStatus; // Part of aggregate
  private _total: Money; // Derived from items
  private _customerId: string; // Reference to another aggregate (Customer)

  /**
   * RULE: Only aggregate root can modify items
   * You cannot do: order.items.push(newItem)
   * You MUST do: order.addItem(...)
   */
  public addItem(productId: string, quantity: number, unitPrice: Money): void {
    // Business rule affecting multiple items
    if (this._status.isShipped()) {
      throw new Error('Cannot modify shipped order');
    }

    const existingItem = this._items.find(
      (item) => item.productId === productId,
    );
    if (existingItem) {
      existingItem.increaseQuantity(quantity); // Still goes through root
    } else {
      const newItem = new OrderItem(productId, quantity, unitPrice);
      this._items.push(newItem);
    }

    this.recalculateTotal(); // Business rule across all items
  }

  /**
   * ATOMIC BUSINESS RULE: Order placement requires items AND valid customer
   * Both conditions must be satisfied together
   */
  public place(): void {
    if (this._items.length === 0) {
      throw new Error('Cannot place empty order');
    }
    if (!this._customerId) {
      throw new Error('Order must have a customer');
    }
    this._status = new OrderStatus(OrderStatusEnum.PLACED);
  }

  private recalculateTotal(): void {
    this._total = this._items.reduce(
      (sum, item) => sum.add(item.total),
      Money.zero(),
    );
  }
}

// This entity is PART OF the aggregate, but not the root
class OrderItem {
  constructor(
    public readonly productId: string,
    private _quantity: number,
    public readonly unitPrice: Money,
  ) {}

  // Can only be called by the aggregate root
  public increaseQuantity(amount: number): void {
    this._quantity += amount;
  }

  get total(): Money {
    return this.unitPrice.multiply(this._quantity);
  }

  get quantity(): number {
    return this._quantity;
  }
}
```

**Aggregate Design Rules:**

1. **Keep aggregates small** - Smaller aggregates are easier to maintain and perform better
2. **Reference by ID** - Don't hold direct references to other aggregates
3. **One transaction, one aggregate** - A transaction should only modify one aggregate instance
4. **Consistency vs Performance** - Strong consistency within aggregate, eventual consistency between aggregates

```typescript
// GOOD - Reference other aggregate by ID
export class Order extends AggregateRoot<OrderId> {
  private _customerId: string; // Reference by ID, not Customer object

  get customerId(): string {
    return this._customerId;
  }
}

// BAD - Direct reference to another aggregate
export class Order extends AggregateRoot<OrderId> {
  private _customer: Customer; // ❌ Creates tight coupling and large transaction scope
}
```

### 4. Domain Events

**What are Domain Events?**  
Domain events capture something meaningful that happened in the domain. They allow different parts of the system to react to changes without tight coupling.

**Key Characteristics:**

- Immutable (capture what happened, can't be changed)
- Named in past tense (OrderCreated, PaymentProcessed)
- Contain relevant data about what happened
- Allow loose coupling between aggregates
- Enable event-driven architecture

**Real-world Example:**

```typescript
// src/domain/events/domain-event.base.ts
export abstract class DomainEvent {
  public readonly occurredAt: Date;
  public readonly eventId: string;

  constructor(
    public readonly aggregateId: string,
    public readonly eventName: string,
  ) {
    this.occurredAt = new Date();
    this.eventId = uuid();
  }
}

// src/domain/events/order-created.event.ts
export class OrderCreatedEvent extends DomainEvent {
  public readonly eventName = 'order.created';

  constructor(
    public readonly orderId: string,
    public readonly customerId: string,
    public readonly total: number,
    public readonly currency: string,
    public readonly items: OrderItemSnapshot[],
  ) {
    super(orderId, 'order.created');
  }
}

// src/domain/events/order-status-changed.event.ts
export class OrderStatusChangedEvent extends DomainEvent {
  public readonly eventName = 'order.status.changed';

  constructor(
    orderId: string,
    public readonly oldStatus: OrderStatusEnum,
    public readonly newStatus: OrderStatusEnum,
    public readonly changedBy: string,
  ) {
    super(orderId, 'order.status.changed');
  }
}

// Usage in aggregate root
export class Order extends AggregateRoot<OrderId> {
  public place(): void {
    if (this._items.length === 0) {
      throw new Error('Cannot place empty order');
    }

    const oldStatus = this._status;
    this._status = new OrderStatus(OrderStatusEnum.PLACED);

    // Record that something important happened
    this.addDomainEvent(
      new OrderStatusChangedEvent(
        this.id.value,
        oldStatus.value,
        this._status.value,
        this._customerId,
      ),
    );
  }
}
```

### 5. Domain Services

**What are Domain Services?**  
Domain services contain domain logic that doesn't naturally fit into a single entity or value object. They represent important business processes or calculations.

**Key Characteristics:**

- Contain stateless business logic
- Operate on multiple domain objects
- Named after business concepts or actions
- Located in domain layer (not application layer)

**Real-world Example:**

```typescript
// src/domain/services/discount-calculator.service.ts

/**
 * WHY A DOMAIN SERVICE?
 * - Discount calculation involves multiple entities (Order, Customer, Product)
 * - Not natural to put in a single entity
 * - Contains complex business rules that could change independently
 * - No infrastructure dependencies
 */
export class DiscountCalculatorService {
  /**
   * Business rule: Calculate discount based on:
   * - Customer loyalty tier
   * - Order total
   * - Seasonal promotions
   * - Product categories
   */
  public calculateDiscount(
    order: Order,
    customer: Customer,
    currentDate: Date,
  ): Money {
    let totalDiscount = Money.zero(order.currency);

    // Rule 1: Loyalty discount
    if (customer.isPremium() && order.total.amount > 1000) {
      totalDiscount = totalDiscount.add(
        Money.create(order.total.amount * 0.1, order.currency),
      );
    }

    // Rule 2: Seasonal promotion
    if (this.isHolidaySeason(currentDate)) {
      totalDiscount = totalDiscount.add(
        Money.create(order.total.amount * 0.05, order.currency),
      );
    }

    // Rule 3: Bulk item discount
    const bulkItems = order.items.filter((item) => item.quantity >= 10);
    if (bulkItems.length > 0) {
      totalDiscount = totalDiscount.add(
        Money.create(order.total.amount * 0.07, order.currency),
      );
    }

    // Rule: Don't exceed 50% of total
    const maxDiscount = Money.create(order.total.amount * 0.5, order.currency);
    if (totalDiscount.amount > maxDiscount.amount) {
      totalDiscount = maxDiscount;
    }

    return totalDiscount;
  }

  private isHolidaySeason(date: Date): boolean {
    const month = date.getMonth();
    return month === 10 || month === 11; // November or December
  }
}
```

### 6. Domain Factories

**What are Domain Factories?**  
Domain factories encapsulate complex creation logic for domain objects, especially aggregates.

**Key Characteristics:**

- Centralize complex creation logic
- Ensure valid objects are created
- Can create from different sources (user input, data from DB, etc.)
- Hide constructor complexity

**Real-world Example:**

```typescript
// src/domain/factories/order.factory.ts

export class OrderFactory {
  /**
   * Create a new Order from user input
   * Handles validation and default values
   */
  public static createFromCheckout(
    customerId: string,
    cartItems: CartItem[],
    shippingAddress: AddressInput,
    currency: string,
  ): Order {
    // Validate customer
    if (!customerId) {
      throw new Error('Customer ID is required');
    }

    // Create the order
    const address = Address.create(
      shippingAddress.street,
      shippingAddress.city,
      shippingAddress.postalCode,
      shippingAddress.country,
    );

    const order = Order.create(customerId, address);

    // Add items from cart
    for (const cartItem of cartItems) {
      const unitPrice = Money.create(cartItem.unitPrice, currency);
      order.addItem(cartItem.productId, cartItem.quantity, unitPrice);
    }

    return order;
  }

  /**
   * Reconstruct Order from database (different creation logic)
   */
  public static reconstitute(
    id: string,
    customerId: string,
    items: PersistedOrderItem[],
    status: OrderStatusEnum,
    total: number,
    currency: string,
    placedAt: Date,
  ): Order {
    // Recreate the order without triggering domain events
    const order = new Order(
      OrderId.fromString(id),
      customerId,
      Address.reconstitute(items[0]?.addressData), // Simplified
    );

    // Add items without validation (since they're from DB)
    for (const item of items) {
      order.addItemDirect(
        item.productId,
        item.quantity,
        Money.create(item.unitPrice, currency),
      );
    }

    // Set internal state
    order['_status'] = new OrderStatus(status);
    order['_total'] = Money.create(total, currency);
    order['_placedAt'] = placedAt;

    return order;
  }
}
```

---

## Application Layer Components

The **Application Layer** orchestrates use cases. It defines what the application can do and coordinates domain objects to accomplish tasks.

### 1. Use Cases

**What are Use Cases?**  
Use cases represent specific business workflows or user interactions with the system. Each use case has a single responsibility and orchestrates domain objects to accomplish a task.

**Key Characteristics:**

- One use case per business operation (Single Responsibility)
- Orchestrate domain objects, but contain no domain logic
- Handle cross-cutting concerns (logging, validation, transactions)
- Define input/output DTOs
- Depend on ports (interfaces), not concrete implementations

**Real-world Example:**

```typescript
// src/application/use-cases/checkout-order.use-case.ts

/**
 * WHY THIS IS A USE CASE?
 * - Represents a specific user goal: "Customer checks out their cart"
 * - Orchestrates multiple domain objects (Order, Inventory, Payment)
 * - Contains NO business logic (that's in domain)
 * - Handles the workflow: validate → create → save → publish events
 */
export class CheckoutOrderUseCase {
  constructor(
    @Inject('OrderRepositoryPort')
    private readonly orderRepository: OrderRepositoryPort,

    @Inject('InventoryServicePort')
    private readonly inventoryService: InventoryServicePort,

    @Inject('PaymentGatewayPort')
    private readonly paymentGateway: PaymentGatewayPort,

    @Inject('EventPublisherPort')
    private readonly eventPublisher: EventPublisherPort,

    private readonly logger: LoggerPort,
  ) {}

  async execute(request: CheckoutOrderRequest): Promise<CheckoutOrderResponse> {
    // Step 1: Validate input (application concern)
    this.validateRequest(request);

    // Step 2: Create domain entities (using factory)
    const order = OrderFactory.createFromCheckout(
      request.customerId,
      request.items,
      request.shippingAddress,
      request.currency,
    );

    // Step 3: Check inventory (calling external service through port)
    const availability = await this.inventoryService.checkAvailability(
      order.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    );

    if (!availability.allAvailable) {
      throw new OutOfStockException(availability.unavailableItems);
    }

    // Step 4: Process payment (can fail - transaction boundaries)
    const payment = await this.paymentGateway.charge({
      orderId: order.id.value,
      amount: order.total,
      paymentMethod: request.paymentMethod,
      customerId: request.customerId,
    });

    if (!payment.success) {
      throw new PaymentFailedException(payment.error);
    }

    // Step 5: Update domain state
    order.markAsPaid(payment.transactionId);
    order.place();

    // Step 6: Persist changes
    await this.orderRepository.save(order);

    // Step 7: Reserve inventory
    await this.inventoryService.reserveStock(order.items);

    // Step 8: Publish events for other services
    for (const event of order.domainEvents) {
      await this.eventPublisher.publish(event.eventName, event);
    }

    // Step 9: Return response
    return {
      orderId: order.id.value,
      status: order.status.value,
      total: order.total.amount,
      paymentTransactionId: payment.transactionId,
    };
  }

  private validateRequest(request: CheckoutOrderRequest): void {
    if (!request.items || request.items.length === 0) {
      throw new ValidationException('Order must contain items');
    }
    // More validation...
  }
}
```

**Use Case vs Domain Service Comparison:**
| **Use Case** | **Domain Service** |
|-------------|-------------------|
| Orchestrates workflow | Implements business logic |
| One per user story | One per business concept |
| Contains application logic | Contains domain logic |
| Can call multiple repositories | Typically doesn't know about persistence |
| Manages transactions | Stateless calculations |
| Example: RegisterUserUseCase | Example: PasswordValidatorService |

### 2. Ports (Interfaces)

**What are Ports?**  
Ports are interfaces that define how the application layer communicates with the outside world. They represent the "holes" in the hexagon where adapters plug in.

**Key Characteristics:**

- Defined in application layer (as interfaces)
- Implemented in infrastructure layer
- Two types: Primary (driving) and Secondary (driven)
- Allow dependency inversion (application doesn't depend on infrastructure)

**Types of Ports:**

**Primary Ports (Driving Ports)** - Called by the outside world:

```typescript
// src/application/ports/input/api.port.ts

/**
 * PRIMARY PORT: Defines how external actors (HTTP, CLI, GraphQL)
 * can interact with the application
 */
export interface OrderManagementPort {
  createOrder(request: CreateOrderRequest): Promise<OrderResponse>;
  updateOrderStatus(orderId: string, status: string): Promise<void>;
  getOrderDetails(orderId: string): Promise<OrderDetails>;
  cancelOrder(orderId: string, reason: string): Promise<void>;
}
```

**Secondary Ports (Driven Ports)** - Called by the application:

```typescript
// src/application/ports/output/repository.port.ts

/**
 * SECONDARY PORT: Defines what the application needs from a repository
 * Application says "I need to save orders" not "I need PostgreSQL"
 */
export interface OrderRepositoryPort {
  save(order: Order): Promise<void>;
  findById(orderId: OrderId): Promise<Order | null>;
  findByCustomer(customerId: string): Promise<Order[]>;
  delete(orderId: OrderId): Promise<void>;
}

// src/application/ports/output/payment-gateway.port.ts
export interface PaymentGatewayPort {
  charge(paymentDetails: PaymentDetails): Promise<PaymentResult>;
  refund(transactionId: string, amount: Money): Promise<RefundResult>;
  getTransaction(transactionId: string): Promise<TransactionStatus>;
}

// src/application/ports/output/notification.port.ts
export interface NotificationPort {
  sendEmail(to: string, subject: string, body: string): Promise<void>;
  sendSMS(phoneNumber: string, message: string): Promise<void>;
}
```

**Why Ports are Critical:**

```typescript
// WITHOUT PORTS (Tight coupling to infrastructure)
class CreateOrderUseCase {
  // ❌ Direct dependency on specific database
  async execute(dto: CreateOrderDto) {
    const prisma = new PrismaClient(); // Tight coupling!
    await prisma.order.create({ data: dto });
    // To change database, we must modify the use case!
  }
}

// WITH PORTS (Loose coupling)
class CreateOrderUseCase {
  // ✅ Depends on abstraction, not concrete implementation
  constructor(
    private readonly orderRepository: OrderRepositoryPort,
    // Can be PostgreSQL, MongoDB, InMemory - use case doesn't care!
  ) {}

  async execute(dto: CreateOrderDto) {
    const order = Order.create(dto);
    await this.orderRepository.save(order);
    // Repository implementation can be swapped without changing use case
  }
}
```

### 3. DTOs (Data Transfer Objects)

**What are DTOs?**  
DTOs are simple objects that carry data between layers. They have no behavior, only properties.

**Key Characteristics:**

- No business logic (dumb data containers)
- Used for input validation (with class-validator)
- Used for API contracts (with Swagger decorators)
- Separate from domain objects (don't leak domain to outside)

**Real-world Example:**

```typescript
// src/application/dtos/create-order.dto.ts

/**
 * INPUT DTO: From client → Application
 * - Validates incoming data
 * - Defines API contract
 * - No domain logic
 */
export class CreateOrderDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsNotEmpty()
  customerId: string;

  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  @MinLength(1, { message: 'Order must have at least one item' })
  items: OrderItemDto[];

  @ApiProperty()
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  @IsNotEmpty()
  shippingAddress: ShippingAddressDto;

  @ApiProperty({ default: 'USD' })
  @IsString()
  @Length(3, 3)
  @IsCurrency()
  currency: string = 'USD';
}

/**
 * OUTPUT DTO: Application → Client
 * - Shapes response data
 * - Hides internal domain details
 * - Can aggregate data from multiple sources
 */
export class OrderResponseDto {
  @ApiProperty()
  orderId: string;

  @ApiProperty({ enum: OrderStatusEnum })
  status: OrderStatusEnum;

  @ApiProperty()
  total: number;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ required: false })
  trackingNumber?: string;
}

/**
 * WHY NOT USE DOMAIN OBJECTS AS DTOs?
 *
 * ❌ BAD: Exposing domain entity directly
 * async getOrder(id: string): Promise<Order> {
 *   return this.orderRepository.findById(id);
 * }
 * Problem: Order entity has methods, references, and internal state
 *
 * ✅ GOOD: Return DTO
 * async getOrder(id: string): Promise<OrderResponseDto> {
 *   const order = await this.orderRepository.findById(id);
 *   return this.mapper.toDto(order); // Controlled what gets exposed
 * }
 */
```

### 4. Mappers

**What are Mappers?**  
Mappers convert objects from one form to another (Domain ↔ DTO, Domain ↔ Persistence).

**Key Characteristics:**

- Bidirectional conversion
- Isolate changes (change DB schema without affecting domain)
- Centralize mapping logic
- Can be simple or complex

**Real-world Example:**

```typescript
// src/application/mappers/order.mapper.ts

@Injectable()
export class OrderMapper {
  /**
   * Domain → DTO (for API responses)
   * Controlled exposure of domain data
   */
  toResponseDto(order: Order): OrderResponseDto {
    const dto = new OrderResponseDto();
    dto.orderId = order.id.value;
    dto.status = order.status.value;
    dto.total = order.total.amount;
    dto.currency = order.total.currency;
    dto.createdAt = order.placedAt;
    dto.trackingNumber = order.trackingNumber;

    // Convert nested objects
    dto.items = order.items.map((item) => ({
      productId: item.productId,
      name: item.productName, // Might come from elsewhere
      quantity: item.quantity,
      unitPrice: item.unitPrice.amount,
      subtotal: item.total.amount,
    }));

    return dto;
  }

  /**
   * DTO → Domain (for creation)
   * Handle complex domain object creation
   */
  toDomainFromCreateDto(dto: CreateOrderDto): Order {
    const address = Address.create(
      dto.shippingAddress.street,
      dto.shippingAddress.city,
      dto.shippingAddress.postalCode,
      dto.shippingAddress.country,
    );

    const order = Order.create(dto.customerId, address);

    for (const item of dto.items) {
      const unitPrice = Money.create(item.unitPrice, dto.currency);
      order.addItem(item.productId, item.quantity, unitPrice);
    }

    return order;
  }
}

// src/infrastructure/repositories/mappers/order-persistence.mapper.ts

/**
 * Infrastructure Mapper: Domain ↔ Database Schema
 * Handles how domain objects are stored
 */
@Injectable()
export class OrderPersistenceMapper {
  /**
   * Domain → Database (for saving)
   */
  toPersistence(order: Order): PrismaOrderModel {
    return {
      id: order.id.value,
      customerId: order.customerId,
      status: order.status.value,
      totalAmount: order.total.amount,
      currency: order.total.currency,
      shippingStreet: order.shippingAddress.street,
      shippingCity: order.shippingAddress.city,
      shippingPostalCode: order.shippingAddress.postalCode,
      shippingCountry: order.shippingAddress.country,
      placedAt: order.placedAt,
      updatedAt: order.updatedAt,
      items: order.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice.amount,
      })),
    };
  }

  /**
   * Database → Domain (for reading)
   * Reconstruct domain objects from database shape
   */
  toDomain(
    record: PrismaOrderModel & { items: PrismaOrderItemModel[] },
  ): Order {
    // Reconstruct without triggering domain events
    const address = Address.reconstitute(
      record.shippingStreet,
      record.shippingCity,
      record.shippingPostalCode,
      record.shippingCountry,
    );

    const order = Order.reconstitute(
      record.id,
      record.customerId,
      address,
      OrderStatusEnum[record.status],
    );

    for (const item of record.items) {
      order.addItemDirect(
        item.productId,
        item.quantity,
        Money.create(item.unitPrice, record.currency),
      );
    }

    order.setTotal(Money.create(record.totalAmount, record.currency));
    order.setPlacedAt(record.placedAt);

    return order;
  }
}
```

---

## Infrastructure Layer Components

The **Infrastructure Layer** provides concrete implementations of ports defined in the application layer.

### 1. Repository Implementations

**What are Repository Implementations?**  
Concrete implementations of repository ports that handle data persistence.

```typescript
// src/infrastructure/repositories/prisma-order.repository.ts

/**
 * IMPLEMENTS the OrderRepositoryPort from application layer
 * Application doesn't know about Prisma, only knows the interface
 */
@Injectable()
export class PrismaOrderRepository implements OrderRepositoryPort {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: OrderPersistenceMapper,
  ) {}

  async save(order: Order): Promise<void> {
    const persistence = this.mapper.toPersistence(order);

    await this.prisma.$transaction(async (tx) => {
      await tx.order.upsert({
        where: { id: persistence.id },
        update: {
          status: persistence.status,
          totalAmount: persistence.totalAmount,
          updatedAt: new Date(),
          items: {
            deleteMany: {},
            create: persistence.items,
          },
        },
        create: persistence,
      });
    });
  }

  async findById(orderId: OrderId): Promise<Order | null> {
    const record = await this.prisma.order.findUnique({
      where: { id: orderId.value },
      include: { items: true },
    });

    if (!record) return null;

    return this.mapper.toDomain(record);
  }
}
```

### 2. External Service Adapters

**What are Adapters?**  
Adapters translate between the application's port interface and external service APIs.

```typescript
// src/infrastructure/http-clients/adapters/stripe-payment.adapter.ts

/**
 * ADAPTER: Implements PaymentGatewayPort using Stripe SDK
 * Application doesn't know about Stripe - only knows the port
 */
@Injectable()
export class StripePaymentAdapter implements PaymentGatewayPort {
  constructor(
    private readonly stripeClient: Stripe,
    private readonly logger: LoggerPort,
  ) {}

  async charge(paymentDetails: PaymentDetails): Promise<PaymentResult> {
    try {
      // Translate from application language to Stripe language
      const paymentIntent = await this.stripeClient.paymentIntents.create({
        amount: this.toStripeAmount(paymentDetails.amount),
        currency: paymentDetails.amount.currency.toLowerCase(),
        payment_method: paymentDetails.paymentMethod.id,
        confirm: true,
        metadata: {
          orderId: paymentDetails.orderId,
          customerId: paymentDetails.customerId,
        },
      });

      // Translate back from Stripe to application language
      return {
        transactionId: paymentIntent.id,
        status: this.mapStripeStatus(paymentIntent.status),
        amount: paymentDetails.amount,
        processedAt: new Date(paymentIntent.created * 1000),
      };
    } catch (error) {
      this.logger.error('Stripe payment failed', error.stack, {
        orderId: paymentDetails.orderId,
      });
      throw new PaymentFailedException(error.message);
    }
  }

  private toStripeAmount(money: Money): number {
    // Stripe uses smallest currency unit (cents for USD)
    return Math.round(money.amount * 100);
  }

  private mapStripeStatus(
    stripeStatus: string,
  ): 'succeeded' | 'failed' | 'pending' {
    const mapping = {
      succeeded: 'succeeded',
      requires_payment_method: 'failed',
      requires_confirmation: 'pending',
    };
    return mapping[stripeStatus] || 'pending';
  }
}
```

### 3. Message Queue Adapters

```typescript
// src/infrastructure/messaging/kafka/kafka-publisher.adapter.ts

@Injectable()
export class KafkaEventPublisherAdapter implements EventPublisherPort {
  constructor(
    private readonly kafkaProducer: KafkaProducer,
    private readonly serializer: AvroSerializer,
  ) {}

  async publish<T>(
    eventName: string,
    payload: T,
    options?: PublishOptions,
  ): Promise<void> {
    // Serialize to standard format (Avro, Protobuf, JSON)
    const serialized = await this.serializer.serialize(eventName, payload);

    // Send to Kafka topic
    await this.kafkaProducer.send({
      topic: this.getTopicForEvent(eventName),
      messages: [
        {
          key: options?.partitionKey,
          value: serialized,
          timestamp: Date.now().toString(),
          headers: {
            eventType: eventName,
            schemaVersion: '1.0.0',
          },
        },
      ],
    });
  }

  private getTopicForEvent(eventName: string): string {
    const topicMap = {
      'order.created': 'orders',
      'order.status.changed': 'order-events',
      'payment.processed': 'payments',
    };
    return topicMap[eventName] || 'default-events';
  }
}
```

---

## API Layer Components

### 1. Controllers (Thin)

Controllers should be thin - they delegate to use cases and handle HTTP-specific concerns.

```typescript
// src/api/controllers/order.controller.ts

/**
 * CONTROLLER is THIN - only handles HTTP concerns:
 * - Extracts data from request
 * - Calls use cases
 * - Returns HTTP responses
 * - NO business logic!
 */
@Controller('api/v1/orders')
@UseGuards(JwtAuthGuard)
@ApiTags('Orders')
export class OrderController {
  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly getOrderQuery: GetOrderQuery,
    private readonly cancelOrderUseCase: CancelOrderUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, type: OrderResponseDto })
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @GetUser() user: User,
  ): Promise<Order
```
