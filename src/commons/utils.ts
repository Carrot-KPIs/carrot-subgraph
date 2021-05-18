/* eslint-disable prefer-const */
import { Address, BigInt } from '@graphprotocol/graph-ts'
import { ERC20 } from '../types/templates/KpiToken/ERC20'
import { ERC20BytesSymbol } from '../types/templates/KpiToken/ERC20BytesSymbol'
import { ERC20BytesName } from '../types/templates/KpiToken/ERC20BytesName'
import { ZERO_BYTES } from './constants'

export function fetchTokenSymbol(tokenAddress: Address): string {
  let stringSymbolERC20Contract = ERC20.bind(tokenAddress)
  let stringSymbolResult = stringSymbolERC20Contract.try_symbol()
  if (!stringSymbolResult.reverted) {
    return stringSymbolResult.value
  }

  let bytesSymbolERC20Contract = ERC20BytesSymbol.bind(tokenAddress)
  let bytesSymbolResult = bytesSymbolERC20Contract.try_symbol()
  if (!bytesSymbolResult.reverted && bytesSymbolResult.value.toHexString() != ZERO_BYTES) {
    return bytesSymbolResult.value.toString()
  }

  return 'Unknown'
}

export function fetchTokenName(tokenAddress: Address): string {
  let stringNameERC20Contract = ERC20.bind(tokenAddress)
  let stringNameResult = stringNameERC20Contract.try_name()
  if (!stringNameResult.reverted) {
    return stringNameResult.value
  }

  let bytesNameERC20Contract = ERC20BytesName.bind(tokenAddress)
  let bytesNameResult = bytesNameERC20Contract.try_name()
  if (!bytesNameResult.reverted && bytesNameResult.value.toHexString() != ZERO_BYTES) {
    return bytesNameResult.value.toString()
  }

  return 'Unknown'
}

export function fetchTokenDecimals(tokenAddress: Address): BigInt {
  let erc20Contract = ERC20.bind(tokenAddress)
  let result = erc20Contract.try_decimals()
  if (!result.reverted) {
    return BigInt.fromI32(result.value as i32)
  }
  return BigInt.fromI32(null as i32)
}
