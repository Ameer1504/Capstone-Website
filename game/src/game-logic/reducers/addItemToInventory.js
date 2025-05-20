import { inventorySpaceRemaining } from '../../utils/index.js'
import { MANURE_MANAGER_ID } from '../../constants.js'

/**
 * Only adds as many items as there is room in the inventory for unless
 * allowInventoryOverage is true.
 * @param {farmhand.state} state
 * @param {farmhand.item} item
 * @param {number} [howMany=1]
 * @param {boolean} [allowInventoryOverage=false]
 * @returns {farmhand.state}
 */
export const addItemToInventory = (
  state,
  item,
  howMany = 1,
  allowInventoryOverage = false
) => {
  const { id } = item
  const inventory = [...state.inventory]

  if (id === MANURE_MANAGER_ID) {
    const alreadyOwnsOne = inventory.some(item => item.id === MANURE_MANAGER_ID)
    if (alreadyOwnsOne) {
      return {
        ...state,
        latestNotification: {
          message: 'You already own a Manure Manager!',
          severity: 'error',
        },
        inventoryAddBlocked: true, // ← signal for purchase logic
      }
    }
  }
  const numberOfItemsToAdd = allowInventoryOverage
    ? howMany
    : Math.min(howMany, inventorySpaceRemaining(state))

  if (numberOfItemsToAdd === 0) {
    return state
  }

  const currentItemSlot = inventory.findIndex(({ id: itemId }) => id === itemId)

  if (~currentItemSlot) {
    const currentItem = inventory[currentItemSlot]

    inventory[currentItemSlot] = {
      ...currentItem,
      quantity: currentItem.quantity + numberOfItemsToAdd,
    }
  } else {
    inventory.push({ id, quantity: numberOfItemsToAdd })
  }

  return { ...state, inventory }
}
