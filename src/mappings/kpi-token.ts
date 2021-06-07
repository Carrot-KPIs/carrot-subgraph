/* eslint-disable prefer-const */
import { dataSource, log } from '@graphprotocol/graph-ts'
import { Finalized, Initialized } from '../types/templates/KpiToken/KpiToken'
import { Collateral, CollateralToken, KpiToken, Question } from '../types/schema'
import { fetchTokenDecimals, fetchTokenName, fetchTokenSymbol } from '../commons/utils'
import { ERC20 } from '../types/templates/KpiToken/ERC20'

export function handleInitialization(event: Initialized): void {
  let kpiTokenAddressFromEvent = event.address
  let kpiToken = new KpiToken(kpiTokenAddressFromEvent.toHexString())
  kpiToken.kpiId = event.params.kpiId
  kpiToken.name = event.params.name
  kpiToken.symbol = event.params.symbol
  kpiToken.totalSupply = event.params.totalSupply
  kpiToken.oracle = event.params.oracle
  kpiToken.finalized = false
  kpiToken.kpiReached = false
  kpiToken.creator = event.params.creator

  let context = dataSource.context()
  kpiToken.fee = context.getBigInt('feeAmount')
  kpiToken.expiresAt = context.getBigInt('kpiExpiry')
  let realitioQuestion = Question.load(event.params.kpiId.toHexString())
  if (!realitioQuestion) {
    log.error('no realitio question for id {}', [event.params.kpiId.toHexString()])
    return
  }
  kpiToken.oracleQuestion = realitioQuestion.id

  let collateralTokenFromEvent = event.params.collateralToken
  let collateralToken = CollateralToken.load(collateralTokenFromEvent.toHexString())
  if (collateralToken == null) {
    collateralToken = new CollateralToken(collateralTokenFromEvent.toHexString())
    collateralToken.symbol = fetchTokenSymbol(collateralTokenFromEvent)
    collateralToken.name = fetchTokenName(collateralTokenFromEvent)
    collateralToken.decimals = fetchTokenDecimals(collateralTokenFromEvent)
    collateralToken.save()
  }

  let collateral = new Collateral(kpiToken.id)
  collateral.token = collateralToken.id

  let erc20Contract = ERC20.bind(collateralTokenFromEvent)
  let balanceOfKpiTokenResult = erc20Contract.try_balanceOf(kpiTokenAddressFromEvent)
  if (balanceOfKpiTokenResult.reverted) {
    log.error('could not fetch balance of collateral {} on kpi token {}', [
      collateralTokenFromEvent.toHexString(),
      kpiTokenAddressFromEvent.toHexString()
    ])
  }
  collateral.amount = balanceOfKpiTokenResult.value
  collateral.save()

  kpiToken.collateral = collateral.id
  kpiToken.save()
}

export function handleFinalization(event: Finalized): void {
  let kpiTokenAddressFromEvent = event.address
  let kpiToken = KpiToken.load(kpiTokenAddressFromEvent.toHexString())
  if (kpiToken == null) {
    log.error('tried to finalize non exitent kpi token at address {}', [kpiTokenAddressFromEvent.toHexString()])
    return
  }
  kpiToken.finalized = true
  kpiToken.save()
}
