gonal + Clean Architecture for NestJS Applications

## Comprehensive Implementation Guide

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Project Structure Deep Dive](#project-structure-deep-dive)
3. [Domain Layer Implementation](#domain-layer-implementation)
4. [Application Layer Implementation](#application-layer-implementation)
5. [Infrastructure Layer Implementation](#infrastructure-layer-implementation)
6. [API Layer Implementation](#api-layer-implementation)
7. [Cross-Cutting Concerns](#cross-cutting-concerns)
8. [External API Integration](#external-api-integration)
9. [Service Communication](#service-communication)
10. [Configuration Management](#configuration-management)
11. [Testing Strategy](#testing-strategy)
12. [Migration Guide](#migration-guide)

---

## Architecture Overview

### Core Principles

The Hexagonal Architecture (also known as Ports & Adapters) combined with Clean Architecture creates a powerful pattern for NestJS applications. The fundamental rule is **dependency inversion**: high-level modules (domain/application) never depend on low-level modules (infrastructure).

```typescript
// ❌ WRONG - Direct infrastructure import in use case
import { PrismaClient } from '@prisma/client';

// ✅ CORRECT - Depends on abstraction only
import { UserRepositoryPort } from '../ports/user-repository.port';
```

### Layer Responsibilities

| Layer | Responsibility | Dependencies |
|-------|---------------|--------------|
| **Domain** | Business entities, value objects, aggregates, domain events | None (completely isolated) |
| **Application** | Use cases, ports (interfaces), DTOs | Domain layer only |
| **Infrastructure** | Adapters (DB, HTTP, messaging), external clients | Application layer (implements ports) |
| **API** | Controllers, middleware, guards | Application layer (calls use cases) |
| **Cross-Cutting** | Logging, metrics, tracing, auth | Application ports (via interfaces) |

---

## Project Structure Deep Dive

### Complete Directory Tree

```
order-service/
├── src/
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── order.entity.ts
│   │   │   └── product.entity.ts
│   │   ├── value-objects/
│   │   │   ├── order-status.vo.ts
│   │   │   ├── money.vo.ts
│   │   │   └── address.vo.ts
│   │   ├── aggregates/
│   │   │   └── order-aggregate.ts
│   │   ├── events/
│   │   │   ├── order-created.event.ts
│   │   │   └── order-status-changed.event.ts
│   │   ├── factories/
│   │   │   └── order.factory.ts
│   │   └── repositories/
│   │       └── order-repository.interface.ts  // Domain repository interface
│   │
│   ├── application/
│   │   ├── use-cases/
│   │   │   ├── commands/
│   │   │   │   ├── create-order/
│   │   │   │   │   ├── create-order.use-case.ts
│   │   │   │   │   └── create-order.dto.ts
│   │   │   │   └── update-order-status/
│   │   │   │       ├── update-order-status.use-case.ts
│   │   │   │       └── update-order-status.dto.ts
│   │   │   └── queries/
│   │   │       ├── get-order/
│   │   │       │   ├── get-order.query.ts
│   │   │       │   └── get-order.dto.ts
│   │   │       └── list-orders/
│   │   │           ├── list-orders.query.ts
│   │   │           └── list-orders.dto.ts
│   │   ├── ports/
│   │   │   ├── repositories/
│   │   │   │   └── order-repository.port.ts
│   │   │   ├── messaging/
│   │   │   │   ├── event-publisher.port.ts
│   │   │   │   └── event-subscriber.port.ts
│   │   │   ├── external/
│   │   │   │   ├── payment-gateway.port.ts
│   │   │   │   └── inventory-service.port.ts
│   │   │   └── cross-cutting/
│   │   │       ├── logger.port.ts
│   │   │       ├── metrics.port.ts
│   │   │       └── cache.port.ts
│   │   ├── mappers/
│   │   │   └── order-dto.mapper.ts
│   │   └── services/
│   │       ├── discount-strategy.interface.ts
│   │       └── percentage-discount.strategy.ts
│   │
│   ├── infrastructure/
│   │   ├── repositories/
│   │   │   ├── prisma/
│   │   │   │   ├── prisma-order.repository.ts
│   │   │   │   └── prisma.service.ts
│   │   │   ├── typeorm/
│   │   │   │   ├── typeorm-order.repository.ts
│   │   │   │   └── entities/
│   │   │   │       └── order.entity.ts
│   │   │   ├── mappers/
│   │   │   │   └── order-domain.mapper.ts
│   │   │   └── in-memory/
│   │   │       └── in-memory-order.repository.ts
│   │   ├── messaging/
│   │   │   ├── kafka/
│   │   │   │   ├── kafka-publisher.adapter.ts
│   │   │   │   ├── kafka-subscriber.adapter.ts
│   │   │   │   └── kafka.config.ts
│   │   │   ├── rabbitmq/
│   │   │   │   ├── rabbitmq-publisher.adapter.ts
│   │   │   │   └── rabbitmq.config.ts
│   │   │   └── serializers/
│   │   │       ├── avro.serializer.ts
│   │   │       └── json.serializer.ts
│   │   ├── http-clients/
│   │   │   ├── payment-gateway/
│   │   │   │   ├── stripe/
│   │   │   │   │   ├── stripe-payment.adapter.ts
│   │   │   │   │   ├── stripe-client.ts
│   │   │   │   │   └── stripe-models.ts
│   │   │   │   └── braintree/
│   │   │   │       ├── braintree-payment.adapter.ts
│   │   │   │       └── braintree-client.ts
│   │   │   ├── inventory-service/
│   │   │   │   ├── inventory-http.client.ts
│   │   │   │   └── inventory-service.adapter.ts
│   │   │   └── interceptors/
│   │   │       ├── retry.interceptor.ts
│   │   │       └── circuit-breaker.ts
│   │   ├── cache/
│   │   │   ├── redis/
│   │   │   │   ├── redis-cache.adapter.ts
│   │   │   │   └── redis.config.ts
│   │   │   └── decorators/
│   │   │       └── cacheable.decorator.ts
│   │   └── config/
│   │       ├── app.config.ts
│   │       ├── database.config.ts
│   │       ├── kafka.config.ts
│   │       └── validation/
│   │           └── env.validation.ts
│   │
│   ├── api/
│   │   ├── controllers/
│   │   │   ├── v1/
│   │   │   │   ├── order.controller.ts
│   │   │   │   └── product.controller.ts
│   │   │   └── webhooks/
│   │   │       ├── stripe-webhook.controller.ts
│   │   │       └── paypal-webhook.controller.ts
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── tenant.middleware.ts
│   │   │   ├── logging.middleware.ts
│   │   │   └── rate-limit.middleware.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   ├── permissions.guard.ts
│   │   │   └── rate-limit.guard.ts
│   │   ├── interceptors/
│   │   │   ├── transform.interceptor.ts
│   │   │   ├── logging.interceptor.ts
│   │   │   └── cache.interceptor.ts
│   │   ├── decorators/
│   │   │   ├── get-user.decorator.ts
│   │   │   ├── roles.decorator.ts
│   │   │   └── rate-limit.decorator.ts
│   │   └── pipes/
│   │       ├── validation.pipe.ts
│   │       └── parse-ulid.pipe.ts
│   │
│   ├── cross-cutting/
│   │   ├── logging/
│   │   │   ├── logger.service.ts
│   │   │   ├── logger.interface.ts
│   │   │   ├── pino-logger.adapter.ts
│   │   │   └── winston-logger.adapter.ts
│   │   ├── metrics/
│   │   │   ├── metrics.service.ts
│   │   │   ├── prometheus.service.ts
│   │   │   └── metrics.module.ts
│   │   ├── tracing/
│   │   │   ├── tracing.service.ts
│   │   │   ├── jaeger-tracer.ts
│   │   │   ├── trace-id.interceptor.ts
│   │   │   └── trace-id.middleware.ts
│   │   ├── auth/
│   │   │   ├── jwt.strategy.ts
│   │   │   ├── jwt-auth.module.ts
│   │   │   └── permissions/
│   │   │       ├── permissions.guard.ts
│   │   │       └── casbin.enforcer.ts
│   │   ├── cache/
│   │   │   ├── cache-manager.service.ts
│   │   │   └── redis-cache.adapter.ts
│   │   └── health/
│   │       ├── health.controller.ts
│   │       └── health.service.ts
│   │
│   └── main.ts
│
├── test/
│   ├── unit/
│   │   ├── domain/
│   │   │   ├── order.entity.spec.ts
│   │   │   └── money.vo.spec.ts
│   │   ├── application/
│   │   │   └── use-cases/
│   │   │       └── create-order.use-case.spec.ts
│   │   └── infrastructure/
│   │       └── prisma-order.repository.spec.ts
│   ├── integration/
│   │   ├── order-flow.spec.ts
│   │   └── payment-gateway.spec.ts
│   └── e2e/
│       └── order-api.e2e-spec.ts
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── config/
│   ├── default.yaml
│   ├── development.yaml
│   ├── staging.yaml
│   ├── production.yaml
│   └── feature-flags.yaml
│
├── docker-compose.yml
├── Dockerfile
├── .env.example
└── package.json
```

---

## Domain Layer Implementation

### 1. Entity Implementation

Entities are objects with identity that change over time. They contain business logic and validation rules.

```typescript
// src/domain/entities/order.entity.ts
import { AggregateRoot } from './aggregate-root.base';
import { OrderId } from '../value-objects/order-id.vo';
import { OrderStatus, OrderStatusEnum } from '../value-objects/order-status.vo';
import { Money } from '../value-objects/money.vo';
import { Address } from '../value-objects/address.vo';
import { OrderItem } from './order-item.entity';
import { OrderCreatedEvent } from '../events/order-created.event';

export class Order extends AggregateRoot<OrderId> {
  private _items: OrderItem[] = [];
  private _status: OrderStatus;
  private _total: Money;
  private _shippingAddress: Address;
  private _customerId: string;
  private _placedAt: Date;
  private _updatedAt: Date;

  private constructor(
    id: OrderId,
    customerId: string,
    shippingAddress: Address,
  ) {
    super(id);
    this._customerId = customerId;
    this._shippingAddress = shippingAddress;
    this._status = new OrderStatus(OrderStatusEnum.DRAFT);
    this._total = Money.zero();
    this._placedAt = new Date();
    this._updatedAt = new Date();
  }

  // Factory method for creating new orders
  public static create(
    customerId: string,
    shippingAddress: Address,
  ): Order {
    const order = new Order(
      OrderId.generate(),
      customerId,
      shippingAddress,
    );
    
    order.addDomainEvent(new OrderCreatedEvent(order));
    
    return order;
  }

  // Business logic method
  public addItem(productId: string, quantity: number, unitPrice: Money): void {
    if (this._status.isShipped()) {
      throw new Error('Cannot add items to shipped order');
    }

    const existingItem = this._items.find(
      item => item.productId === productId
    );

    if (existingItem) {
      existingItem.increaseQuantity(quantity);
    } else {
      const newItem = new OrderItem(productId, quantity, unitPrice);
      this._items.push(newItem);
    }

    this.recalculateTotal();
    this._updatedAt = new Date();
  }

  public place(): void {
    if (this._items.length === 0) {
      throw new Error('Cannot place order without items');
    }

    this._status = new OrderStatus(OrderStatusEnum.PLACED);
    this._updatedAt = new Date();
  }

  public ship(): void {
    if (!this._status.isPlaced()) {
      throw new Error('Only placed orders can be shipped');
    }

    this._status = new OrderStatus(OrderStatusEnum.SHIPPED);
    this._updatedAt = new Date();
  }

  public cancel(): void {
    if (this._status.isShipped()) {
      throw new Error('Cannot cancel shipped order');
    }

    this._status = new OrderStatus(OrderStatusEnum.CANCELLED);
    this._updatedAt = new Date();
  }

  private recalculateTotal(): void {
    this._total = this._items.reduce(
      (sum, item) => sum.add(item.total),
      Money.zero(),
    );
  }

  // Getters
  get items(): readonly OrderItem[] {
    return [...this._items];
  }

  get status(): OrderStatus {
    return this._status;
  }

  get total(): Money {
    return this._total;
  }

  get customerId(): string {
    return this._customerId;
  }

  get shippingAddress(): Address {
    return this._shippingAddress;
  }
}
```

### 2. Value Objects

Value objects have no identity and are immutable. They're defined by their attributes.

```typescript
// src/domain/value-objects/money.vo.ts
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

  public static create(amount: number, currency: string): Money {
    return new Money(amount, currency);
  }

  public static zero(currency: string = 'USD'): Money {
    return new Money(0, currency);
  }

  public add(other: Money): Money {
    if (this._currency !== other._currency) {
      throw new Error('Cannot add different currencies');
    }
    return new Money(this._amount + other._amount, this._currency);
  }

  public subtract(other: Money): Money {
    if (this._currency !== other._currency) {
      throw new Error('Cannot subtract different currencies');
    }
    return new Money(this._amount - other._amount, this._currency);
  }

  public multiply(factor: number): Money {
    return new Money(this._amount * factor, this._currency);
  }

  public isGreaterThan(other: Money): boolean {
    this.ensureSameCurrency(other);
    return this._amount > other._amount;
  }

  private ensureSameCurrency(other: Money): void {
    if (this._currency !== other._currency) {
      throw new Error('Currencies do not match');
    }
  }

  get amount(): number {
    return this._amount;
  }

  get currency(): string {
    return this._currency;
  }

  // Value object equality
  public equals(other: Money): boolean {
    return this._amount === other._amount && this._currency === other._currency;
  }
}

// src/domain/value-objects/order-status.vo.ts
export enum OrderStatusEnum {
  DRAFT = 'DRAFT',
  PLACED = 'PLACED',
  CONFIRMED = 'CONFIRMED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export class OrderStatus {
  constructor(private readonly _value: OrderStatusEnum) {}

  public isDraft(): boolean {
    return this._value === OrderStatusEnum.DRAFT;
  }

  public isPlaced(): boolean {
    return this._value === OrderStatusEnum.PLACED;
  }

  public isConfirmed(): boolean {
    return this._value === OrderStatusEnum.CONFIRMED;
  }

  public isShipped(): boolean {
    return this._value === OrderStatusEnum.SHIPPED;
  }

  public canTransitionTo(newStatus: OrderStatusEnum): boolean {
    const transitions: Record<OrderStatusEnum, OrderStatusEnum[]> = {
      [OrderStatusEnum.DRAFT]: [OrderStatusEnum.PLACED, OrderStatusEnum.CANCELLED],
      [OrderStatusEnum.PLACED]: [OrderStatusEnum.CONFIRMED, OrderStatusEnum.CANCELLED],
      [OrderStatusEnum.CONFIRMED]: [OrderStatusEnum.SHIPPED],
      [OrderStatusEnum.SHIPPED]: [OrderStatusEnum.DELIVERED],
      [OrderStatusEnum.DELIVERED]: [],
      [OrderStatusEnum.CANCELLED]: [],
    };

    return transitions[this._value].includes(newStatus);
  }

  get value(): OrderStatusEnum {
    return this._value;
  }
}
```

### 3. Aggregate Root Base Class

```typescript
// src/domain/aggregate-root.base.ts
import { DomainEvent } from './domain-event.base';

export abstract class AggregateRoot<TId> {
  private _domainEvents: DomainEvent[] = [];

  constructor(protected readonly _id: TId) {}

  get id(): TId {
    return this._id;
  }

  get domainEvents(): readonly DomainEvent[] {
    return [...this._domainEvents];
  }

  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  public clearEvents(): void {
    this._domainEvents = [];
  }
}

// src/domain/domain-event.base.ts
export abstract class DomainEvent {
  public readonly occurredAt: Date;
  
  constructor(
    public readonly aggregateId: string,
    public readonly eventName: string,
  ) {
    this.occurredAt = new Date();
  }
}
```

### 4. Domain Events

```typescript
// src/domain/events/order-created.event.ts
import { DomainEvent } from '../aggregate-root.base';
import { Order } from '../entities/order.entity';

export class OrderCreatedEvent extends DomainEvent {
  public readonly eventName = 'order.created';
  public readonly orderId: string;
  public readonly customerId: string;
  public readonly total: number;

  constructor(order: Order) {
    super(order.id.value, 'order.created');
    this.orderId = order.id.value;
    this.customerId = order.customerId;
    this.total = order.total.amount;
  }
}
```

### 5. Domain Repository Interface

```typescript
// src/domain/repositories/order-repository.interface.ts
import { Order } from '../entities/order.entity';
import { OrderId } from '../value-objects/order-id.vo';

// This is a domain repository interface - note it uses domain objects
export interface IOrderRepository {
  findById(id: OrderId): Promise<Order | null>;
  save(order: Order): Promise<void>;
  delete(order: Order): Promise<void>;
  findByCustomerId(customerId: string): Promise<Order[]>;
}
```

---

## Application Layer Implementation

### 1. Ports (Interfaces)

Ports define the contracts that infrastructure must implement.

```typescript
// src/application/ports/repositories/order-repository.port.ts
import { Order } from '../../../domain/entities/order.entity';
import { OrderId } from '../../../domain/value-objects/order-id.vo';

export interface OrderRepositoryPort {
  findById(id: OrderId): Promise<Order | null>;
  save(order: Order): Promise<void>;
  delete(order: Order): Promise<void>;
  findByCustomerId(customerId: string): Promise<Order[]>;
  exists(id: OrderId): Promise<boolean>;
  update(order: Order): Promise<void>;
}

// src/application/ports/messaging/event-publisher.port.ts
export interface EventPublisherPort {
  publish<T>(eventName: string, payload: T, options?: PublishOptions): Promise<void>;
  publishBatch<T>(events: { eventName: string; payload: T }[]): Promise<void>;
}

interface PublishOptions {
  partitionKey?: string;
  delayMs?: number;
}

// src/application/ports/external/payment-gateway.port.ts
export interface PaymentGatewayPort {
  charge(paymentDetails: PaymentDetails): Promise<PaymentResult>;
  refund(transactionId: string, amount?: Money): Promise<RefundResult>;
  getTransactionStatus(transactionId: string): Promise<TransactionStatus>;
}

export interface PaymentDetails {
  orderId: string;
  amount: Money;
  paymentMethod: PaymentMethod;
  customerId: string;
  metadata?: Record<string, any>;
}

export interface PaymentResult {
  transactionId: string;
  status: 'succeeded' | 'failed' | 'pending';
  amount: Money;
  processedAt: Date;
  errorMessage?: string;
}

// src/application/ports/cross-cutting/logger.port.ts
export interface LoggerPort {
  debug(message: string, context?: Record<string, any>): void;
  info(message: string, context?: Record<string, any>): void;
  warn(message: string, context?: Record<string, any>): void;
  error(message: string, trace?: string, context?: Record<string, any>): void;
}

// src/application/ports/cross-cutting/cache.port.ts
export interface CachePort {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: any, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  clear(): Promise<void>;
}
```

### 2. Use Cases (Commands)

```typescript
// src/application/use-cases/commands/create-order/create-order.use-case.ts
import { Injectable, Inject } from '@nestjs/common';
import { Order } from '../../../../domain/entities/order.entity';
import { Money } from '../../../../domain/value-objects/money.vo';
import { Address } from '../../../../domain/value-objects/address.vo';
import { OrderRepositoryPort } from '../../../ports/repositories/order-repository.port';
import { EventPublisherPort } from '../../../ports/messaging/event-publisher.port';
import { LoggerPort } from '../../../ports/cross-cutting/logger.port';
import { CachePort } from '../../../ports/cross-cutting/cache.port';
import { CreateOrderDto, CreateOrderResponseDto } from './create-order.dto';
import { OrderDtoMapper } from '../../../mappers/order-dto.mapper';

@Injectable()
export class CreateOrderUseCase {
  constructor(
    @Inject('OrderRepositoryPort')
    private readonly orderRepository: OrderRepositoryPort,
    
    @Inject('EventPublisherPort')
    private readonly eventPublisher: EventPublisherPort,
    
    @Inject('LoggerPort')
    private readonly logger: LoggerPort,
    
    @Inject('CachePort')
    private readonly cache: CachePort,
    
    private readonly mapper: OrderDtoMapper,
  ) {}

  async execute(dto: CreateOrderDto): Promise<CreateOrderResponseDto> {
    this.logger.info('Creating order', { customerId: dto.customerId });

    // 1. Validate input
    await this.validateInput(dto);

    // 2. Create domain entity
    const shippingAddress = Address.create(
      dto.shippingAddress.street,
      dto.shippingAddress.city,
      dto.shippingAddress.postalCode,
      dto.shippingAddress.country,
    );

    const order = Order.create(dto.customerId, shippingAddress);

    // 3. Add items
    for (const item of dto.items) {
      const unitPrice = Money.create(item.unitPrice, dto.currency);
      order.addItem(item.productId, item.quantity, unitPrice);
    }

    // 4. Apply business rule: place order
    order.place();

    // 5. Persist
    await this.orderRepository.save(order);

    // 6. Invalidate cache
    await this.cache.delete(`orders:customer:${dto.customerId}`);

    // 7. Publish domain events
    for (const event of order.domainEvents) {
      await this.eventPublisher.publish(event.eventName, event);
    }

    // 8. Clear events from aggregate
    order.clearEvents();

    this.logger.info('Order created successfully', { orderId: order.id.value });

    // 9. Return DTO
    return this.mapper.toResponseDto(order);
  }

  private async validateInput(dto: CreateOrderDto): Promise<void> {
    if (!dto.items || dto.items.length === 0) {
      throw new Error('Order must contain at least one item');
    }

    for (const item of dto.items) {
      if (item.quantity <= 0) {
        throw new Error('Item quantity must be positive');
      }
      
      if (item.unitPrice <= 0) {
        throw new Error('Item unit price must be positive');
      }
    }
  }
}
```

### 3. Use Cases (Queries)

Queries are read-only operations that don't modify state.

```typescript
// src/application/use-cases/queries/get-order/get-order.query.ts
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { OrderRepositoryPort } from '../../../ports/repositories/order-repository.port';
import { CachePort } from '../../../ports/cross-cutting/cache.port';
import { LoggerPort } from '../../../ports/cross-cutting/logger.port';
import { OrderId } from '../../../../domain/value-objects/order-id.vo';
import { GetOrderResponseDto } from './get-order.dto';
import { OrderDtoMapper } from '../../../mappers/order-dto.mapper';

@Injectable()
export class GetOrderQuery {
  constructor(
    @Inject('OrderRepositoryPort')
    private readonly orderRepository: OrderRepositoryPort,
    
    @Inject('CachePort')
    private readonly cache: CachePort,
    
    @Inject('LoggerPort')
    private readonly logger: LoggerPort,
    
    private readonly mapper: OrderDtoMapper,
  ) {}

  async execute(orderId: string): Promise<GetOrderResponseDto> {
    this.logger.debug('Fetching order', { orderId });

    // 1. Try cache first
    const cacheKey = `order:${orderId}`;
    const cached = await this.cache.get<GetOrderResponseDto>(cacheKey);
    
    if (cached) {
      this.logger.debug('Order found in cache', { orderId });
      return cached;
    }

    // 2. Fetch from repository
    const orderIdVO = OrderId.fromString(orderId);
    const order = await this.orderRepository.findById(orderIdVO);

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    // 3. Map to DTO
    const response = this.mapper.toResponseDto(order);

    // 4. Cache for future requests
    await this.cache.set(cacheKey, response, 300); // Cache for 5 minutes

    return response;
  }
}
```

### 4. DTO Objects

DTOs (Data Transfer Objects) define the shape of data entering and leaving the application.

```typescript
// src/application/use-cases/commands/create-order/create-order.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { 
  IsString, 
  IsArray, 
  ValidateNested, 
  IsNumber, 
  Min,
  IsNotEmpty,
  IsUUID,
  IsCurrency,
} from 'class-validator';

export class OrderItemDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty()
  @IsNumber()
  @Min(0.01)
  unitPrice: number;
}

export class ShippingAddressDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  street: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  postalCode: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  country: string;
}

export class CreateOrderDto {
  @ApiProperty()
  @IsUUID()
  customerId: string;

  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty()
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress: ShippingAddressDto;

  @ApiProperty()
  @IsCurrency()
  currency: string = 'USD';
}

export class CreateOrderResponseDto {
  @ApiProperty()
  orderId: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  total: number;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  createdAt: Date;
}
```

### 5. Mappers

Mappers convert between domain objects and DTOs.

```typescript
// src/application/mappers/order-dto.mapper.ts
import { Injectable } from '@nestjs/common';
import { Order } from '../../domain/entities/order.entity';
import { CreateOrderResponseDto } from '../use-cases/commands/create-order/create-order.dto';
import { GetOrderResponseDto } from '../use-cases/queries/get-order/get-order.dto';

@Injectable()
export class OrderDtoMapper {
  toResponseDto(order: Order): CreateOrderResponseDto {
    const dto = new CreateOrderResponseDto();
    dto.orderId = order.id.value;
    dto.status = order.status.value;
    dto.total = order.total.amount;
    dto.currency = order.total.currency;
    dto.createdAt = order['_placedAt']; // Access private property or add getter
    return dto;
  }

  toDetailedResponseDto(order: Order): GetOrderResponseDto {
    const dto = new GetOrderResponseDto();
    dto.orderId = order.id.value;
    dto.customerId = order.customerId;
    dto.status = order.status.value;
    dto.total = order.total.amount;
    dto.currency = order.total.currency;
    dto.items = order.items.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice.amount,
      total: item.total.amount,
    }));
    dto.shippingAddress = {
      street: order.shippingAddress.street,
      city: order.shippingAddress.city,
      postalCode: order.shippingAddress.postalCode,
      country: order.shippingAddress.country,
    };
    dto.createdAt = order['_placedAt'];
    dto.updatedAt = order['_updatedAt'];
    return dto;
  }
}
```

### 6. Strategy Pattern in Application Layer

```typescript
// src/application/services/discount-strategy.interface.ts
export interface DiscountStrategy {
  calculate(orderTotal: number): number;
  getStrategyName(): string;
}

// src/application/services/percentage-discount.strategy.ts
import { DiscountStrategy } from './discount-strategy.interface';

export class PercentageDiscountStrategy implements DiscountStrategy {
  constructor(private readonly percentage: number) {}

  calculate(orderTotal: number): number {
    return orderTotal * (this.percentage / 100);
  }

  getStrategyName(): string {
    return `PercentageDiscount_${this.percentage}`;
  }
}

// src/application/services/bulk-discount.strategy.ts
export class BulkDiscountStrategy implements DiscountStrategy {
  constructor(private readonly minimumItems: number, private readonly discountAmount: number) {}

  calculate(orderTotal: number, itemCount: number): number {
    if (itemCount >= this.minimumItems) {
      return this.discountAmount;
    }
    return 0;
  }

  getStrategyName(): string {
    return `BulkDiscount_${this.minimumItems}_${this.discountAmount}`;
  }
}
```

---

## Infrastructure Layer Implementation

### 1. Repository Adapters (Database)

```typescript
// src/infrastructure/repositories/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

// src/infrastructure/repositories/prisma/prisma-order.repository.ts
import { Injectable } from '@nestjs/common';
import { OrderRepositoryPort } from '../../../application/ports/repositories/order-repository.port';
import { Order } from '../../../domain/entities/order.entity';
import { OrderId } from '../../../domain/value-objects/order-id.vo';
import { OrderStatus, OrderStatusEnum } from '../../../domain/value-objects/order-status.vo';
import { Money } from '../../../domain/value-objects/money.vo';
import { Address } from '../../../domain/value-objects/address.vo';
import { PrismaService } from './prisma.service';
import { OrderDomainMapper } from '../mappers/order-domain.mapper';

@Injectable()
export class PrismaOrderRepository implements OrderRepositoryPort {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: OrderDomainMapper,
  ) {}

  async findById(id: OrderId): Promise<Order | null> {
    const record = await this.prisma.order.findUnique({
      where: { id: id.value },
      include: {
        items: true,
      },
    });

    if (!record) {
      return null;
    }

    return this.mapper.toDomain(record);
  }

  async save(order: Order): Promise<void> {
    const persistenceModel = this.mapper.toPersistence(order);

    await this.prisma.order.upsert({
      where: { id: order.id.value },
      update: {
        status: persistenceModel.status,
        total: persistenceModel.total,
        updatedAt: new Date(),
        items: {
          deleteMany: {},
          create: persistenceModel.items,
        },
      },
      create: persistenceModel,
    });
  }

  async delete(order: Order):
