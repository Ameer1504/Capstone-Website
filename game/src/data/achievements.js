/** @typedef {import('../index.js').farmhand.achievement} farmhand.achievement */
import { addItemToInventory } from '../game-logic/reducers/index.js'
import {
  doesPlotContainCrop,
  dollarString,
  getCropLifeStage,
  getProfitRecord,
  integerString,
  isOctober,
  moneyTotal,
  percentageString,
} from '../utils/index.js'
import { memoize } from '../utils/memoize.js'
import { findInField } from '../utils/findInField.js'
import { addExperience } from '../game-logic/reducers/index.js'
import { cropLifeStage, standardCowColors } from '../enums.js'
import {
  COW_FEED_ITEM_ID,
  EXPERIENCE_VALUES,
  I_AM_RICH_BONUSES,
} from '../constants.js'

import { itemsMap } from './maps.js'

const { SEED } = cropLifeStage

const addMoney = (state, reward) => ({
  ...state,
  money: moneyTotal(state.money, reward),
})

const sumOfCropsHarvested = memoize(cropsHarvested =>
  Object.values(cropsHarvested).reduce(
    (sum, cropHarvested) => sum + cropHarvested,
    0
  )
)

const cowFeed = itemsMap[COW_FEED_ITEM_ID]

/**
 * @type {farmhand.achievement[]}
 */
const achievements = []

export default achievements

export const achievementsMap = {}
