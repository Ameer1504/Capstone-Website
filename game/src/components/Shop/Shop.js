import React, { useState } from 'react'
import { array, func, number, object } from 'prop-types'
import Button from '@mui/material/Button/index.js'
import Card from '@mui/material/Card/index.js'
import CardActions from '@mui/material/CardActions/index.js'
import CardContent from '@mui/material/CardContent/index.js'
import CardHeader from '@mui/material/CardHeader/index.js'
import Tab from '@mui/material/Tab/index.js'
import Tabs from '@mui/material/Tabs/index.js'
import Typography from '@mui/material/Typography/index.js'

import FarmhandContext from '../Farmhand/Farmhand.context.js'
import { features } from '../../config.js'
import { moneyString } from '../../utils/moneyString.js'
import {
  dollarString,
  getCostOfNextStorageExpansion,
  integerString,
} from '../../utils/index.js'
import { memoize } from '../../utils/memoize.js'
import { items } from '../../img/index.js'
import { toolType, stageFocusType } from '../../enums.js'
import {
  INFINITE_STORAGE_LIMIT,
  PURCHASEABLE_CELLARS,
  PURCHASEABLE_COMBINES,
  PURCHASEABLE_COMPOSTERS,
  PURCHASEABLE_COW_PENS,
  PURCHASEABLE_FIELD_SIZES,
  PURCHASABLE_FOREST_SIZES,
  PURCHASEABLE_SMELTERS,
  STORAGE_EXPANSION_AMOUNT,
} from '../../constants.js'
import Inventory from '../Inventory/index.js'
import TierPurchase from '../TierPurchase/index.js'

import { TabPanel, a11yProps } from './TabPanel/index.js'

import './Shop.sass'

/**
 * @param {Array.<farmhand.item>} shopInventory
 * @returns {Object.<'fieldTools', Array.<farmhand.item>>}
 */
const categorizeShopInventory = memoize(shopInventory =>
  shopInventory.reduce(
    (acc, inventoryItem) => {
      acc.fieldTools.push(inventoryItem)
      return acc
    },
    { fieldTools: [] }
  )
)

export const Shop = ({
  handleCombinePurchase,
  handleComposterPurchase,
  handleCowPenPurchase,
  handleCellarPurchase,
  handleFieldPurchase,
  handleForestPurchase,
  handleSmelterPurchase,
  handleStorageExpansionPurchase,
  inventoryLimit,
  levelEntitlements,
  money,
  purchasedCombine,
  purchasedComposter,
  purchasedCowPen,
  purchasedCellar,
  purchasedField,
  purchasedForest,
  purchasedSmelter,
  shopInventory,
  toolLevels,

  storageUpgradeCost = getCostOfNextStorageExpansion(inventoryLimit),
}) => {
  const [currentTab, setCurrentTab] = useState(0)

  const { fieldTools } = categorizeShopInventory(shopInventory)

  const isForestUnlocked =
    levelEntitlements.stageFocusType[stageFocusType.FOREST]

  return (
    <div className="Shop">
      <Tabs
        value={currentTab}
        onChange={(_e, newTab) => setCurrentTab(newTab)}
        aria-label="Shop tabs"
      >
        <Tab {...{ label: 'Supplies', ...a11yProps(0) }} />
        <Tab {...{ label: 'Upgrades', ...a11yProps(1) }} />
      </Tabs>
      <TabPanel value={currentTab} index={0}>
        <Inventory
          {...{
            items: fieldTools,
            isPurchaseView: true,
            placeholder: 'Search supplies...',
          }}
        />
      </TabPanel>
      <TabPanel value={currentTab} index={1}>
        <ul className="card-list">
          {inventoryLimit > INFINITE_STORAGE_LIMIT && (
            <li>
              <Card>
                <CardHeader
                  {...{
                    avatar: (
                      <img
                        {...{ src: items['inventory-box'] }}
                        alt={'Inventory box'}
                      />
                    ),
                    title: 'Storage Unit',
                    subheader: (
                      <div>
                        <p>Price: {moneyString(storageUpgradeCost)}</p>
                        <p>
                          Current inventory space:{' '}
                          {integerString(inventoryLimit)}
                        </p>
                      </div>
                    ),
                  }}
                />
                <CardContent>
                  <Typography>
                    Purchase a Storage Unit to increase your inventory capacity
                    for {STORAGE_EXPANSION_AMOUNT} more items.
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    {...{
                      disabled: money < storageUpgradeCost,
                      color: 'primary',
                      onClick: handleStorageExpansionPurchase,
                      variant: 'contained',
                    }}
                  >
                    Buy
                  </Button>
                </CardActions>
              </Card>
            </li>
          )}
          <li>
            <TierPurchase
              {...{
                onBuyClick: handleCowPenPurchase,
                maxedOutPlaceholder:
                  "You've purchased the largest cow pen available!",
                purchasedTier: purchasedCowPen,
                renderTierLabel: ({ cows, price }) =>
                  `${dollarString(price)}: ${cows} cow pen`,
                tiers: PURCHASEABLE_COW_PENS,
                title: 'Buy cow pen',
              }}
            />
          </li>
        </ul>
      </TabPanel>
    </div>
  )
}

Shop.propTypes = {
  handleCombinePurchase: func.isRequired,
  handleCowPenPurchase: func.isRequired,
  handleCellarPurchase: func.isRequired,
  handleFieldPurchase: func.isRequired,
  handleStorageExpansionPurchase: func.isRequired,
  inventoryLimit: number.isRequired,
  money: number.isRequired,
  purchasedCowPen: number.isRequired,
  purchasedCellar: number.isRequired,
  purchasedField: number.isRequired,
  purchasedSmelter: number.isRequired,
  purchasedCombine: number.isRequired,
  shopInventory: array.isRequired,
  toolLevels: object.isRequired,
  valueAdjustments: object.isRequired,
}

export default function Consumer(props) {
  return (
    <FarmhandContext.Consumer>
      {({ gameState, handlers }) => (
        <Shop {...{ ...gameState, ...handlers, ...props }} />
      )}
    </FarmhandContext.Consumer>
  )
}
