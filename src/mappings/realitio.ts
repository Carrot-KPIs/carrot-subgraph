/* eslint-disable prefer-const */
import { LogNewQuestion } from '../types/Realitio/Realitio'
import { Question } from '../types/schema'

export function handleNewQuestion(event: LogNewQuestion): void {
  let question = new Question(event.params.question_id.toHexString())
  question.text = event.params.question.split('\u241f')[0]
  question.save()
}
