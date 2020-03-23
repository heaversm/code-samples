import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import useAppContext, { providerPropTypes } from './hooks/useAppContext';
import AppContext from './contexts/AppContext';

import Fade from './components/Fade';
import ProductLanding from './pages/ProductLanding';
import Cart from './pages/Cart';

function App() {
  const appContextValue = useAppContext();
  return (
    <AppContext.Provider value={appContextValue}>
      <Router>
        <ProductLanding />
        <Switch>
          <Route path="/cart">
            <Fade>
              <Cart />
            </Fade>
          </Route>
        </Switch>
      </Router>
    </AppContext.Provider>
  );
}

AppContext.Provider.propTypes = providerPropTypes;

export default App;
