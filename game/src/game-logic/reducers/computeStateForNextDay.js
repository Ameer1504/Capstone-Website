import { generateCow } from '../../utils/index.js'
import { generateValueAdjustments } from '../../common/utils.js'
import { EXPERIENCE_VALUES } from '../../constants.js'

import { WATER_CREDIT_ID } from '../../constants.js'

import { OUT_OF_WATER_CREDIT_NOTIFICATION } from '../../strings.js'

import { addExperience } from './addExperience.js'
import { applyLoanInterest } from './applyLoanInterest.js'
import { computeCowInventoryForNextDay } from './computeCowInventoryForNextDay.js'
import { generatePriceEvents } from './generatePriceEvents.js'
import { processCellar } from './processCellar.js'
import { processCowAttrition } from './processCowAttrition.js'
import { processCowBreeding } from './processCowBreeding.js'
import { processCowFertilizerProduction } from './processCowFertilizerProduction.js'
import { processFeedingCows } from './processFeedingCows.js'
import { processField } from './processField.js'
import { processMilkingCows } from './processMilkingCows.js'
import { processNerfs } from './processNerfs.js'
import { processSprinklers } from './processSprinklers.js'
import { processWeather } from './processWeather.js'
import { rotateNotificationLogs } from './rotateNotificationLogs.js'
import { updateFinancialRecords } from './updateFinancialRecords.js'
import { updateInventoryRecordsForNextDay } from './updateInventoryRecordsForNextDay.js'
import { updatePriceEvents } from './updatePriceEvents.js'
/**
 * @param {farmhand.state} state
 * @returns {farmhand.state}
 */
const adjustItemValues = state => ({
  ...state,
  historicalValueAdjustments: [state.valueAdjustments],
  valueAdjustments: generateValueAdjustments(
    state.priceCrashes,
    state.priceSurges
  ),
})

/**
 * @param {farmhand.state} state
 * @returns {farmhand.state}
 */

export const computeStateForNextDay = (state, isFirstDay = false) => {
  // // Check if there's enough water credit before proceeding
  const newDayNotifications = [...state.newDayNotifications]
  const inventory = [...state.inventory]
  const waterCreditInventoryPosition = inventory.findIndex(
    ({ id }) => id === WATER_CREDIT_ID
  )
  const waterCredit = inventory[waterCreditInventoryPosition]
  const waterQuantity = waterCredit ? waterCredit.quantity : 0
  const cowInventory = [...state.cowInventory]
  const { length: cowInventoryLength } = cowInventory

  if (waterQuantity < cowInventoryLength && cowInventoryLength > 0) {
    // Ensure it's set as the latestNotification and also added to today's notifications
    state = {
      ...state,
      latestNotification: {
        message: 'Not enough water credit to advance to the next day.',
        severity: 'error',
      },
      // Push it to today's notifications if not already there
      todaysNotifications: state.todaysNotifications.find(
        notification =>
          notification.message ===
          'Not enough water credit to advance to the next day.'
      )
        ? state.todaysNotifications
        : [
            ...state.todaysNotifications,
            {
              message: 'Not enough water credit to advance to the next day.',
              severity: 'error',
            },
          ],
    }

    // Prevent the day from advancing and return the updated state
    return state
  }

  const reducers = isFirstDay
    ? [processField]
    : [
        computeCowInventoryForNextDay,
        processCowBreeding,
        processField,
        processNerfs,
        processWeather,
        processSprinklers,
        processFeedingCows,
        processCowAttrition,
        processMilkingCows,
        processCowFertilizerProduction,
        processCellar,
        updatePriceEvents,
        updateFinancialRecords,
        updateInventoryRecordsForNextDay,
        generatePriceEvents,
        applyLoanInterest,
        rotateNotificationLogs,
      ]

  state = reducers
    .concat([adjustItemValues])
    .reduce((acc, fn) => fn({ ...acc }), {
      ...state,
      cowForSale: generateCow(),
      dayCount: state.dayCount + 1,
      todaysNotifications: [],
    })

  if (state.dayCount % 365 === 0) {
    state = addExperience(state, EXPERIENCE_VALUES.NEW_YEAR)
  }

  return state
}
