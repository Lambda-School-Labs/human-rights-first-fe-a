import React from 'react';
import { render, act } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import 'jest-canvas-mock';
// Provider components
import OktaWrapper from '../components/OktaWrapper';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
// Redux store
// import store from '../store';
import configureMockStore from 'redux-mock-store';

import * as antd from 'antd';
// Provides a custom render function for tests that makes Redux, React Router,
// and Okta available to components

// Configure Mock Store *currently empty middleware
const middlewares = [];
const mockStore = configureMockStore(middlewares);

let state = {
  api: {
    incidents: {
      getincidents: { status: 'idle', error: null },
      gettimeline: { status: 'idle', error: null },
    },
  },
  incident: { data: {}, ids: [], timeline: [], tagIndex: {} },
  user: {
    status: { authenticated: false, pending: false },
    tokens: { access: null, id: null },
    info: null,
  },
};

const store = mockStore(() => state);

console.log(store);
function Wrapper(props) {
  return (
    <Provider store={store}>
      <MemoryRouter>
        <OktaWrapper>{props.children}</OktaWrapper>
      </MemoryRouter>
    </Provider>
  );
}
const wrapRender = async (component, options) => {
  let renderReturned;
  // Wrapping the render function in an async act() callback prevents an error related
  // to state updates in Okta's Security component (over which we have no control)
  await act(async () => {
    renderReturned = await render(component, { wrapper: Wrapper, ...options });
  });
  return renderReturned; // act() requires no return value, so return what render would normally return
};

// Jest mocks
jest.mock('react-chartjs-2', () => ({
  // See https://github.com/reactchartjs/react-chartjs-2/issues/155
  Line: () => <div></div>,
  Bar: () => <div></div>,
  HorizontalBar: () => <div></div>,
  Pie: () => <div></div>,
}));

jest.mock('antd', () => {
  const antd = jest.requireActual('antd');
  return {
    __esModule: true,
    ...antd,
    Modal: () => <div></div>,
    List: () => <div></div>,
  };
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: () => ({ addListener: jest.fn(), removeListener: jest.fn() }),
});

// Re-export React Testing Library
export * from '@testing-library/react';

// Override custom exports
export { wrapRender as render };
