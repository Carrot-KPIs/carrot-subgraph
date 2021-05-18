/* eslint-disable prefer-const */
import { Factory } from '../types/schema'
import { KpiToken } from '../types/templates'
import { getFactoryAddress } from '../commons/addresses'
import { KpiTokenCreated } from '../types/Factory/Factory'
import { DataSourceContext } from '@graphprotocol/graph-ts'

export function handleNewKpiToken(event: KpiTokenCreated): void {
  let factoryAddress = getFactoryAddress()
  let factory = Factory.load(factoryAddress)
  if (factory === null) {
    factory = new Factory(factoryAddress)
    factory.kpiTokensCount = 0
  }
  factory.kpiTokensCount = factory.kpiTokensCount + 1
  factory.save()

  let dataSourceContext = new DataSourceContext()
  dataSourceContext.setBigInt('feeAmount', event.params.feeAmount)
  KpiToken.createWithContext(event.params.kpiToken, dataSourceContext)
}
