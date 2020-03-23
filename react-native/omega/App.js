// Imports {{{

import {
  NavigationProvider,
  StackNavigation,
} from '@instrument/ex-navigation'
import { StatusBar } from 'react-native'
import { observer } from 'mobx-react/native'
import React from 'react'
import mobx from 'mobx'

import { ROUTES } from 'constants/routes'
import AppChromeState from 'stores/AppChromeState'
import Router from 'Router'

// }}}

// throw an exception on any attempt to modify MobX state outside an action
mobx.useStrict(true)

// log all mobx actions when in development mode
if (__DEV__) {
  mobx.spy(ev => {
    if (ev.type === 'action') {
      console.log('ACTION: ' + ev.name)
    }
  })
}

@observer
export default class App extends React.Component {
  render() {
    return (
      <NavigationProvider router={Router}>
        <StatusBar
          hidden={AppChromeState.statusBarHidden}
          animated={AppChromeState.animateStatusBar}
          barStyle={AppChromeState.statusBarColor}
          showHideTransition={AppChromeState.statusBarTransition}
        />
        <StackNavigation
          navigatorUID='main'
          id='main'
          // Will be passed to all Routes
          defaultRouteConfig={{
            backgroundColor: 'transparent',
            paddingBottom: 60,
            navigationBar: {
              visible: false,
            },
          }}
          // NOTE: change the initial route if you are working on something and want to navigate directly to that
          initialRoute={Router.getRoute(ROUTES.APP_LANDING)} //OPTION / VERSION MENU FOR APP
        // ACTUAL APP ROUTES:
        // initialRoute={Router.getRoute(ROUTES.TAB_SWITCHER)}
        />
      </NavigationProvider>
    )
  }
}
