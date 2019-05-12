import { parse } from 'url';
import citys from './geographic/city.json';
import provinces from './geographic/province.json';
import moment from 'moment';

// mock tableListDataSource
let tableListDataSource = [];
for (let i = 0; i < 34; i += 1) {
  tableListDataSource.push({
    key: i,
    // disabled: i % 6 === 0, 提供这个值可以灰掉前面的复选框
    callNo: Math.floor(Math.random() * 100),
    updatedAt: new Date(`2019-05-${Math.floor(i / 2) + 1}`),
    createdAt: new Date(`2019-05-${Math.floor(i / 2) + 1}`),
    progress: Math.ceil(Math.random() * 100),
    qqno: Math.floor(Math.random() * 1000000000),
    status: Math.floor(Math.random() * 10) % 5,
    expiretime: new Date(`2019-05-${Math.floor(i / 2) + 1}`),
    machinenum: Math.floor(Math.random() * 100),
    region: `我是一个区域${i}`,
    store: `我是一个分店信息${i}`,
    netbarname: `我是一个网吧${i}`,
    contactname: `姓名${i}`,
    contactqq: Math.floor(Math.random() * 1000000000),
    contactphone: Math.floor(Math.random() * 1000000000),
    contactaddress: `我是一个详细地址${i}`,
    geographic: [
      {
        province: {
          label: '浙江省',
          key: '330000',
        },
        city: {
          label: '杭州市',
          key: '330100',
        },
      },
      {
        province: {
          label: '广东省',
          key: '440000',
        },
        city: {
          label: '深圳市',
          key: '440300',
        },
      },
    ][i % 2],
  });
}

function getNetBar(req, res, u) {
  // console.log('getNetBar: ', 'req-', req, '  res: ', res, '  u: ', u);
  let url = u;
  if (!url || Object.prototype.toString.call(url) !== '[object String]') {
    url = req.url; // eslint-disable-line
  }

  const params = parse(url, true).query;
  console.log('getNetbar -- params: ', params);
  let dataSource = tableListDataSource;

  // 排序
  if (params.sorter) {
    const s = params.sorter.split('_');
    dataSource = dataSource.sort((prev, next) => {
      if (s[1] === 'descend') {
        return next[s[0]] - prev[s[0]];
      }
      return prev[s[0]] - next[s[0]];
    });
  }

  // 直属代理匹配
  if (params.qqno) {
    const qqno = params.qqno.split(',');
    // console.log('qqno: ', qqno);
    let filterDataSource = [];
    qqno.forEach(s => {
      filterDataSource = filterDataSource.concat(
        dataSource.filter(data => parseInt(data.qqno, 10) === parseInt(s, 10))
      );
    });
    dataSource = filterDataSource;
  }

  // 状态匹配
  if (params.status && params.status != '-1') {
    const status = params.status.split(',');
    let filterDataSource = [];
    status.forEach(s => {
      filterDataSource = filterDataSource.concat(
        dataSource.filter(data => parseInt(data.status, 10) === parseInt(s[0], 10))
      );
    });
    dataSource = filterDataSource;
  }

  // 套餐机器数查询
  if (params.machinenummin || params.machinenummax) {
    let machinenummin = 0;
    if (params.machinenummin) {
      machinenummin = parseInt(params.machinenummin, 10);
    }
    if (params.machinenummax) {
      const machinenummax = parseInt(params.machinenummax, 10);
      dataSource = dataSource.filter(
        data =>
          parseInt(data.machinenum, 10) >= machinenummin &&
          parseInt(data.machinenum, 10) <= machinenummax
      );
    } else {
      dataSource = dataSource.filter(data => parseInt(data.machinenum, 10) >= machinenummin);
    }
  }

  // 过期时间查询
  if (params.begintime || params.endtime) {
    // console.log('params.begintime: ', params.begintime, 'params.endtime: ', params.endtime);
    let begintime = moment('1977-12-25').unix(Number);
    let endtime = moment('2995-12-25').unix(Number);
    if (params.begintime) {
      // eslint-disable-next-line prefer-destructuring
      begintime = params.begintime;
    }
    if (params.endtime) {
      // eslint-disable-next-line prefer-destructuring
      endtime = params.endtime;
    }
    dataSource = dataSource.filter(
      data =>
        moment(data.expiretime).unix(Number) >= begintime &&
        moment(data.expiretime).unix(Number) <= endtime
    );
  }

  // 网吧名称匹配
  if (params.netbarname) {
    dataSource = dataSource.filter(data => data.netbarname.indexOf(params.netbarname) > -1);
  }

  // 网吧区域匹配
  if (params.province && params.province != '无') {
    dataSource = dataSource.filter(data => data.geographic.province.label === params.province);
  }

  // 网吧区域匹配
  if (params.city && params.city != '无') {
    dataSource = dataSource.filter(data => data.geographic.city.label === params.city);
  }

  let pageSize = 10;
  if (params.pageSize) {
    pageSize = params.pageSize * 1;
  }

  const result = {
    list: dataSource,
    pagination: {
      total: dataSource.length,
      pageSize,
      current: parseInt(params.currentPage, 10) || 1,
    },
  };

  return res.json(result);
}

function getId(province) {
  let filter = provinces.filter(data => data.name === province);
  console.log("getCity - filter: ", filter);
  if (filter.length > 0) {
    return filter[0];
  }
  return {};
}

function getCity(cusprovince, city) {
  if (cusprovince === {}) {
    return {};
  }
  let filter = citys[cusprovince.id].filter(data => data.name === city);
  console.log("getCity - filter: ", filter);
  if (filter.length > 0) {
    return filter[0];
  }
  return {};
}

function postNetBar(req, res, u, b) {
  // console.log('postNetBar: ', 'req-', req, '  res: ', res, '  u: ', u, ' b: ', b);
  let url = u;
  if (!url || Object.prototype.toString.call(url) !== '[object String]') {
    url = req.url; // eslint-disable-line
  }

  const body = (b && b.body) || req.body;
  console.log('postNetbar: body - ', body);
  const {
    method,
    netbarname,
    key,
    status,
    province,
    city,
    store,
    contactname,
    contactqq,
    contactphone,
    contactaddress,
  } = body;


  switch (method) {
    /* eslint no-case-declarations:0 */
    case 'delete':
      tableListDataSource = tableListDataSource.filter(item => key.indexOf(item.key) === -1);
      break;
    case 'post':
      const i = Math.ceil(Math.random() * 10000);
      let cusprovince = getId(province);
      let cuscity = getCity(cusprovince, city);
      console.log("cusprovince: ", cusprovince);
      console.log("cuscity: ", cuscity);
      tableListDataSource.unshift({
        key: i,
        // disabled: i % 6 === 0, 提供这个值可以灰掉前面的复选框
        callNo: Math.floor(Math.random() * 100),
        updatedAt: new Date(),
        createdAt: new Date(),
        progress: Math.ceil(Math.random() * 100),
        qqno: '-',
        budget: Math.floor(Math.random() * 10) % 2,
        type: Math.floor(Math.random() * 10) % 3,
        status: status,
        expiretime: '-',
        machinenum: Math.floor(Math.random() * 100),
        region: `我是一个区域${i}`,
        store: store,
        netbarname: netbarname,
        contactname: contactname,
        contactqq: contactqq,
        contactphone: contactphone,
        contactaddress: contactaddress,
        geographic: {
          province: {
            label: cusprovince.name,
            key: cusprovince.id
          },
          city: {
            label: cuscity.name,
            key: cuscity.id
          },
        },
      });
      break;
    case 'update':
      tableListDataSource = tableListDataSource.map(item => {
        if (item.key === key) {
          console.log("item: ", item);
          Object.assign(item, {
            store,
            netbarname,
            contactname,
            contactqq,
            contactphone,
            contactaddress,
          });
          return item;
        }
        return item;
      });
      break;
    default:
      break;
  }

  return getNetBar(req, res, u);
}

export default {
  'GET /api/mnetbar': getNetBar,
  'POST /api/mnetbar': postNetBar,
};
