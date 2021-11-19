/* eslint-disable prefer-const */
import { dataSource, log } from '@graphprotocol/graph-ts'
import { Finalized, Initialized } from '../types/templates/KpiToken/KpiToken'
import { Collateral, CollateralToken, KpiToken, Question } from '../types/schema'
import { fetchTokenDecimals, fetchTokenName, fetchTokenSymbol } from '../commons/utils'
import { ERC20 } from '../types/templates/KpiToken/ERC20'
import { BI_0 } from '../commons/constants'

export function handleInitialization(event: Initialized): void {
  let kpiTokenAddressFromEvent = event.address
  let kpiToken = new KpiToken(kpiTokenAddressFromEvent.toHexString())
  kpiToken.kpiId = event.params.kpiId
  kpiToken.name = event.params.tokenData.name
  kpiToken.symbol = event.params.tokenData.symbol
  kpiToken.totalSupply = event.params.tokenData.totalSupply
  kpiToken.oracle = event.params.oracle
  kpiToken.finalized = false
  kpiToken.kpiReached = false
  kpiToken.creator = event.params.creator
  kpiToken.lowerBound = event.params.scalarData.lowerBound
  kpiToken.higherBound = event.params.scalarData.higherBound
  kpiToken.finalProgress = BI_0

  let context = dataSource.context()
  kpiToken.fee = context.getBigInt('feeAmount')
  kpiToken.expiresAt = context.getBigInt('kpiExpiry')
  let realitioQuestion = Question.load(event.params.kpiId.toHexString())
  if (!realitioQuestion) throw new Error('no realitio question for id '.concat(event.params.kpiId.toHexString()))
  kpiToken.oracleQuestion = realitioQuestion.id

  let collateralTokenFromEvent = event.params.collateral.token
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
  kpiToken.kpiReached = event.params.finalKpiProgress >= kpiToken.higherBound
  kpiToken.finalProgress = event.params.finalKpiProgress
  kpiToken.save()
}
