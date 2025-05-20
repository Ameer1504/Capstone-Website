import React from 'react'

import { func, object } from 'prop-types'
import ReactMarkdown from 'react-markdown'
import globalWindow from 'global/window.js'
import Button from '@mui/material/Button/index.js'
import Divider from '@mui/material/Divider/index.js'
import Accordion from '@mui/material/Accordion/index.js'
import AccordionSummary from '@mui/material/AccordionSummary/index.js'
import AccordionDetails from '@mui/material/AccordionDetails/index.js'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore.js'
import Card from '@mui/material/Card/index.js'
import CardContent from '@mui/material/CardContent/index.js'

import { items } from '../../img/index.js'

import { achievementsMap } from '../../data/achievements.js'
import FarmhandContext from '../Farmhand/Farmhand.context.js'
import { STANDARD_LOAN_AMOUNT } from '../../constants.js'
import { stageFocusType } from '../../enums.js'
import { isDecember } from '../../utils/index.js'
import { memoize } from '../../utils/memoize.js'
import Achievement from '../Achievement/index.js'

import { SnowBackground } from './SnowBackground.js'
import './Home.sass'

const onboardingAchievements = [
  achievementsMap['plant-crop'],
  achievementsMap['water-crop'],
  achievementsMap['harvest-crop'],
  achievementsMap['purchase-cow-pen'],
]

const getRemainingOnboardingAchievements = memoize(completedAchievements =>
  onboardingAchievements.filter(
    achievement => achievement && !completedAchievements[achievement.id]
  )
)

const environmentAllowsInstall = ['production', 'development'].includes(
  import.meta.env?.MODE
)

const VALID_ORIGINS = [
  'https://jeremyckahn.github.io',
  'https://www.farmhand.life',
  'http://localhost:3000',
]

// https://stackoverflow.com/questions/41742390/javascript-to-check-if-pwa-or-mobile-web/41749865#41749865
const isInstallable =
  environmentAllowsInstall &&
  !globalWindow.matchMedia('(display-mode: standalone)').matches &&
  VALID_ORIGINS.includes(globalWindow.location.origin)

const Home = ({
  completedAchievements,
  handleViewChangeButtonClick,

  remainingOnboardingAchievements = getRemainingOnboardingAchievements(
    completedAchievements
  ),
}) => (
  <div className="Home">
    {isDecember() ? (
      <>
        <SnowBackground />
        <h1 className="holiday-greeting">
          Happy holidays!{' '}
          <span role="img" aria-label="Snowman">
            ⛄️
          </span>
        </h1>
      </>
    ) : (
      <h1>Welcome!</h1>
    )}
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <h2>Click to read a note from the developer</h2>
      </AccordionSummary>
      <AccordionDetails>
        <ReactMarkdown
          {...{
            linkTarget: '_blank',
            className: 'markdown',
            source: `
Hi, you're playing **Farmhand**! This is an open source game project created by Jeremy Kahn and edited by project group HoTsPot. It simulates Water Credits, their role in livestock farming and other items/technology that is available in real-life and can help farmers save up more Water Credits.

This game is still in alpha version, so any opinions and suggestions are welcome!
    `,
          }}
        />
      </AccordionDetails>
    </Accordion>
    <Divider />
    <Card>
      <CardContent>
        <ReactMarkdown
          {...{
            className: 'markdown',
            linkTarget: '_blank',
            source: `
### How to play

The goal of Farmhand is to make money by buying, growing, harvesting, and then selling crops. Keep an eye on prices though, because they go up and down every day! The best farmers buy seeds for a low price and sell them for a high price.

If you can master the art of the harvest, there's no limit to how profitable you can become! Every farmer starts with a $${STANDARD_LOAN_AMOUNT} loan from the bank. If you run out of money, you can always take out another loan. Be careful though, because the bank takes a portion of your sales until the debt is repaid. You can access your bank account in the menu.
    `,
          }}
        />
        {remainingOnboardingAchievements.length ? (
          <>
            <ReactMarkdown
              {...{
                className: 'markdown',
                linkTarget: '_blank',
                source: `
### Getting started

It looks like you're new here. Thanks for stopping by! Here are some goals to help you get familiar with the game.
    `,
              }}
            />
            <ul className="card-list"></ul>
          </>
        ) : null}
        <Button
          {...{
            color: 'primary',
            onClick: () => handleViewChangeButtonClick(stageFocusType.SHOP),
            variant: 'contained',
          }}
        >
          Go to the shop
        </Button>
      </CardContent>
    </Card>
    <Divider />
    {isInstallable && (
      <>
        <Card>
          <CardContent>
            <ReactMarkdown
              {...{
                className: 'markdown',
                linkTarget: '_blank',
                source: `
### Installation

Farmhand can be installed to your device right from this web page! Once installed, the game can be played with or without an internet connection.

If you're playing on a mobile device, all you need to do is [add it to your home screen](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Installing#add_to_home_screen). If you're playing it on desktop Chrome or Microsoft Edge, [you can install it as an app there as well](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Installing#installing_pwas).
    `,
              }}
            />
          </CardContent>
        </Card>
        <Divider />
      </>
    )}
    <Card>
      <CardContent>
        <ReactMarkdown
          {...{
            className: 'markdown',
            linkTarget: '_blank',
            source: `
### A few other tips

* Press the bed button in the top-right of the screen to end the farm day and advance the game. This also saves your progress.

* Crops need to be watered daily to grow.

* Keep the field free of weeds with the scythe or the hoe.

* Crafting items out of harvested crops in the Workshop is an excellent way to make money!

* Purchasing a cow pen will allow you to buy, sell, milk, and breed cows. Can you breed the mythical Rainbow Cow?

* Put up a scarecrow to protect your field!

* Watch your inventory space as you obtain items. You can purchase additional Storage Units in the shop.

* You'll be able to unlock new crops and items as you level up. Sell crops, milk, and crafted items to gain experience!

* Bank loans accrue interest daily, so pay off your balance as soon as you can.

* Press "Shift + ?" to see all of the keyboard shortcuts available to you.

    `,
          }}
        />
      </CardContent>
    </Card>
  </div>
)

Home.propTypes = {
  completedAchievements: object.isRequired,
  handleViewChangeButtonClick: func.isRequired,
}

export default function Consumer(props) {
  return (
    <FarmhandContext.Consumer>
      {({ gameState, handlers }) => (
        <Home {...{ ...gameState, ...handlers, ...props }} />
      )}
    </FarmhandContext.Consumer>
  )
}
