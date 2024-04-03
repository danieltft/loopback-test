import {Interceptor} from '@loopback/core';
import {IsolationLevel, juggler} from '@loopback/repository';
import HttpError, {STATUS_INTERNAL_SERVER_ERROR} from '../common/http';

export const TransactionInterceptor: Interceptor = async (invocationCtx, next) => {
  // Get the current controller target
  const controller: any = await invocationCtx.get('controller.current');

  // Obtain the datasource to begin the transaction
  const dataSource = controller.repository.dataSource as juggler.DataSource;

  const transaction = await dataSource.beginTransaction(
    IsolationLevel.READ_COMMITTED
  );
  console.log('transaction begin');
  try {
    // Go with the normal logic
    const result = await next();

    // Commit the database changes
    console.log('trying to commit');
    await transaction.commit();

    console.log('comiited transaction');
    return result;
  } catch (err: any) {
    console.log(err);
    // Rollback the changes if any error happens
    await transaction.rollback();
    throw new HttpError(
      err.message,
      STATUS_INTERNAL_SERVER_ERROR
    );
  }
}
