/**
 * @typedef {import('../index').farmhand.item} farmhand.item
 */

import { watercredit, manureManager } from './items.js'

import { fertilizer } from './recipes.js'

/** @type {farmhand.item[]} */
const inventory = [watercredit, manureManager]

export default inventory

export const itemIds = new Set(inventory.map(item => item.id))
