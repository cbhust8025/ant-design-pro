/* eslint-disable no-console */
import { queryRule, removeRule, addRule, updateRule } from '@/services/api';

export default {
  namespace: 'rule',

  state: {
    data: {
      list: [],
      pagination: {},
    },
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      console.log('table/fetch -- payload: ', payload, '  call :', call, ' put: ', put);
      const response = yield call(queryRule, payload);
      console.log('table/fetch -- response: ', response);
      yield put({
        type: 'save',
        payload: response,
      });
    },
    *add({ payload, callback }, { call, put }) {
      console.log(
        'table/add -- payload: ',
        payload,
        '  call :',
        call,
        ' put: ',
        put,
        ' callback: ',
        callback
      );
      const response = yield call(addRule, payload);
      yield put({
        type: 'save',
        payload: response,
      });
      if (callback) callback();
    },
    *remove({ payload, callback }, { call, put }) {
      console.log(
        'table/remove -- payload: ',
        payload,
        '  call :',
        call,
        ' put: ',
        put,
        ' callback: ',
        callback
      );
      const response = yield call(removeRule, payload);
      yield put({
        type: 'save',
        payload: response,
      });
      if (callback) callback();
    },
    *update({ payload, callback }, { call, put }) {
      console.log(
        'table/update payload: ',
        payload,
        '  call :',
        call,
        ' put: ',
        put,
        ' callback: ',
        callback
      );
      const response = yield call(updateRule, payload);
      yield put({
        type: 'save',
        payload: response,
      });
      if (callback) callback();
    },
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
  },
};
