/* eslint-disable no-console */
import { queryMNetBar, removeMNetBar, addMNetBar, updateMNetBar } from '@/services/api';

export default {
  namespace: 'query',

  state: {
    data: {
      list: [],
      pagination: {},
    },
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      console.log('NetBar/fetch -- payload: ', payload, '  call :', call, ' put: ', put);
      const response = yield call(queryMNetBar, payload);
      yield put({
        type: 'save',
        payload: response,
      });
    },
    *add({ payload, callback }, { call, put }) {
      console.log(
        'add -- payload: ',
        payload,
        '  call :',
        call,
        ' put: ',
        put,
        ' callback: ',
        callback
      );
      const response = yield call(addMNetBar, payload);
      yield put({
        type: 'save',
        payload: response,
      });
      if (callback) callback();
    },
    *remove({ payload, callback }, { call, put }) {
      console.log(
        'remove -- payload: ',
        payload,
        '  call :',
        call,
        ' put: ',
        put,
        ' callback: ',
        callback
      );
      const response = yield call(removeMNetBar, payload);
      yield put({
        type: 'save',
        payload: response,
      });
      if (callback) callback();
    },
    *update({ payload, callback }, { call, put }) {
      console.log(
        'update -- payload: ',
        payload,
        '  call :',
        call,
        ' put: ',
        put,
        ' callback: ',
        callback
      );
      const response = yield call(updateMNetBar, payload);
      yield put({
        type: 'save',
        payload: response,
      });
      if (callback) callback();
    },
  },

  reducers: {
    save(state, action) {
      console.log('save: ', '  state: ', state, '  action: ', action);
      return {
        ...state,
        data: action.payload,
      };
    },
  },
};
