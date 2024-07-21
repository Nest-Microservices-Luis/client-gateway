import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { NATS_SERVICE } from 'src/config';
import {
  CreateOrderDto,
  OrderPaginationDto,
  PatchOrderStatusDto,
  StatusDto,
} from './dto';
import { catchError } from 'rxjs';
import { PaginationDto } from 'src/common';

@Controller('orders')
export class OrdersController {
  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}

  @Post()
  createOrder(@Body() order: CreateOrderDto) {
    return this.client.send('createOrder', order);
  }

  @Get()
  findAllOrders(@Query() paginationDto: OrderPaginationDto) {
    return this.client.send('findAllOrders', paginationDto);
  }

  @Get('id/:id')
  findOneOrder(@Param('id', ParseUUIDPipe) id: string) {
    return this.client.send('findOneOrder', { id }).pipe(
      catchError((err) => {
        throw new RpcException(err);
      }),
    );
  }

  @Get(':status')
  findAllByStatus(
    @Param() statusDto: StatusDto,
    @Query() pagination: PaginationDto,
  ) {
    return this.client
      .send('findAllOrders', {
        ...pagination,
        status: statusDto.status,
      })
      .pipe(
        catchError((err) => {
          throw new RpcException(err);
        }),
      );
  }

  @Patch(':id')
  changeOrderStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() status: PatchOrderStatusDto,
  ) {
    return this.client
      .send('changeOrderStatus', {
        ...status,
        id,
      })
      .pipe(
        catchError((err) => {
          throw new RpcException(err);
        }),
      );
  }
}
