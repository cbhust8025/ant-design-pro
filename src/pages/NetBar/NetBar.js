/* eslint-disable no-console */
import React, { Component, Fragment } from 'react';
import { formatMessage } from 'umi-plugin-react/locale';
import { Button, DatePicker, Row, Col, Icon, Input, Form, Select, Badge, Modal, Divider } from 'antd';
import { connect } from 'dva';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';

import moment from 'moment';
import GeographicView from './GeographicView';
import StandardTable from '@/components/StandardTable';
import styles from './NetBar.less';

const FormItem = Form.Item;
const { RangePicker } = DatePicker;
const { Option } = Select;
const begin_time = moment('1977-12-25');
const end_time = moment('2995-12-25');
const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');

const statusMap = ['effective', 'expire', 'expiresoon', 'neveropen', 'trial'];
const status = ['生效中', '已过期', '即将到期', '未开通', '试用'];

const validatorGeographic = (rule, value, callback) => {
  console.log('value； ', value, '  callback: ', callback);
  const { province, city } = value;
  if (!province.key) {
    callback('Please input your province!');
  }
  if (!city.key) {
    callback('Please input your city!');
  }
  callback();
};

Form.create()(props => {
  const { modalVisible, form, handleAdd, handleModalVisible } = props;
  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      console.log('create -- err: ', err, '  fieldsValue: ', fieldsValue);
      if (err) return;
      form.resetFields();
      console.log('create -- err: ', err, '  fieldsValue: ', fieldsValue);
      handleAdd(fieldsValue);
    });
  };
  return (
    <Modal
      destroyOnClose
      title="新建规则"
      visible={modalVisible}
      onOk={okHandle}
      onCancel={() => handleModalVisible()}
    >
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="描述">
        {form.getFieldDecorator('desc', {
          rules: [{ required: true, message: '请输入至少五个字符的规则描述！', min: 5 }],
        })(<Input placeholder="请输入" />)}
      </FormItem>
    </Modal>
  );
});
@connect(({ query, loading }) => {
  console.log('connect: ', '  query: ', query, '  loading: ', loading);
  return {
    query,
    loading: loading.models.query,
  };
})
@Form.create()
class NetBar extends Component {
  state = {
    selectedRows: [],
    expandForm: false,
    formValues: {},
    time: [undefined, undefined],
  };

  columns = [
    {
      title: '序号',
      dataIndex: 'key',
    },
    {
      title: '区域',
      dataIndex: 'geographic',
      sorter: true,
      render: val => <span>{val.province.label + ' ' + val.city.label}</span>,
    },
    {
      title: '网吧名称',
      dataIndex: 'netbarname',
    },
    {
      title: '套餐机器数',
      dataIndex: 'machinenum',
    },
    {
      title: '直属代理',
      dataIndex: 'qqno',
    },
    {
      title: '到期时间',
      dataIndex: 'expiretime',
      sorter: true,
      render: val => <span>{moment(val).format('YYYY-MM-DD')}</span>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      // filters: [
      //   {
      //     text: status[0],
      //     value: 0,
      //   },
      //   {
      //     text: status[1],
      //     value: 1,
      //   },
      //   {
      //     text: status[2],
      //     value: 2,
      //   },
      //   {
      //     text: status[3],
      //     value: 3,
      //   },
      //   {
      //     text: status[4],
      //     value: 4,
      //   },
      // ],
      render(val) {
        return <Badge status={statusMap[val]} text={status[val]} />;
      },
    },
    {
      title: '操作',
      render: (text, record) => this.renderOperation(text, record),
    },
  ];

  componentDidMount() {
    console.log('componentDidMount');
    const { dispatch, form } = this.props;
    console.log('componentDidMount： ', this.props);

    // 设置表单默认值
    form.setFieldsInitialValue({
      geographic: {
        province: {
          label: '无',
          key: '100000',
        },
        city: {
          label: '无',
          key: '100100',
        },
      },
    });
    dispatch({
      type: 'query/fetch',
    });
  }

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    console.log('handleStandardTableChange enter');
    console.log('pagination', pagination, ' filtersArg', filtersArg, ' sorter: ', sorter);
    const { dispatch } = this.props;
    const { formValues } = this.state;

    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = { ...obj };
      newObj[key] = getValue(filtersArg[key]);
      return newObj;
    }, {});

    const params = {
      currentPage: pagination.current,
      pageSize: pagination.pageSize,
      ...formValues,
      ...filters,
    };
    if (sorter.field) {
      params.sorter = `${sorter.field}_${sorter.order}`;
    }
    console.log('params: ', params);
    dispatch({
      type: 'query/fetch',
      payload: params,
    });
  };

  toggleForm = () => {
    const { expandForm } = this.state;
    this.setState({
      expandForm: !expandForm,
    });
  };

  handleSearch = e => {
    console.log('handlesearch: this.props: ', this.props);
    e.preventDefault();
    const { dispatch, form } = this.props;
    const { time } = this.state;

    form.validateFields((err, fieldsValue) => {
      // console.log("err: ", err);
      if (err) return;
      console.log('handleSearch - fieldsValue: ', fieldsValue);
      let values = {
        // eslint-disable-next-line object-shorthand
        begintime: time[0] !== undefined ? time[0].unix(Number) : begin_time.unix(Number),
        // eslint-disable-next-line object-shorthand
        endtime: time[1] !== undefined ? time[1].unix(Number) : end_time.unix(Number),
        ...fieldsValue,
      };
      console.log('search : values', values);
      this.setState({
        formValues: values,
      });

      if (fieldsValue.geographic != undefined) {
        if (fieldsValue.geographic.province != undefined) {
          values.province = fieldsValue.geographic.province.label;
          if (fieldsValue.geographic.city) {
            values.city = fieldsValue.geographic.city.label;
          }
        }
      }
      console.log('pro -values: ', values);
      dispatch({
        type: 'query/fetch',
        payload: values,
      });
    });
  };

  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    console.log('form.getFields: ', form.getFieldsValue());

    this.setState({
      formValues: {},
      time: [undefined, undefined],
    });
    // console.log('picker: ', this.picker);
    dispatch({
      type: 'query/fetch',
      payload: {},
    });
  };

  handleSelectRows = rows => {
    console.log('handleSelectRows enter: ', rows);
    this.setState({
      selectedRows: rows,
    });
  };

  onPanelChange = dates => {
    // console.log("dates:", dates, "datestring: ", dateStrings);
    console.log('onPanelChange: ', dates[0], ', to: ', dates[1]);
    // console.log('From: ', dateStrings[0], ', to: ', dateStrings[1]);
    this.setState({
      time: [
        dates[0] !== undefined ? dates[0] : begin_time,
        dates[1] !== undefined ? dates[1] : end_time,
      ],
    });
  };

  onChange = dates => {
    // console.log("dates:", dates, "datestring: ", dateStrings);
    console.log('onChange: ', dates[0], ', to: ', dates[1]);
    // console.log('From: ', dateStrings[0], ', to: ', dateStrings[1]);
    this.setState({
      time: [dates[0], dates[1]],
    });
  };

  onOk = dates => {
    const { dispatch, form } = this.props;
    // console.log("dates:", dates, "datestring: ", dateStrings);
    console.log('From: ', dates[0], ', to: ', dates[1]);
    // console.log('From: ', dateStrings[0], ', to: ', dateStrings[1]);

    form.validateFields((err, fieldsValue) => {
      if (err) return;
      console.log('fieldsValue: ', fieldsValue);
      const values = {
        begintime: dates[0] !== undefined ? dates[0].unix(Number) : begin_time.unix(Number),
        endtime: dates[1] !== undefined ? dates[1].unix(Number) : end_time.unix(Number),
        ...fieldsValue,
        updatedAt: fieldsValue.updatedAt && fieldsValue.updatedAt.valueOf(),
      };

      this.setState({
        formValues: values,
        time: [
          dates[0] !== undefined ? dates[0] : begin_time,
          dates[1] !== undefined ? dates[1] : end_time,
        ],
      });

      dispatch({
        type: 'query/fetch',
        payload: values,
      });
    });
  };

  renderSimpleForm() {
    console.log('renderSimpleForm this.props: ', this.props);
    const {
      form: { getFieldDecorator },
      query: { data },
    } = this.props;
    console.log('fieldsValue: ', this.state.formValues);
    // console.log('renderSimpleForm - data: ', data);
    // const options = data.list.map(d => <Option key={d.value}>{d.text}</Option>);
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={6} sm={24}>
            <FormItem label={formatMessage({ id: 'app.netbar.barname' })}>
              {getFieldDecorator('netbarname')(<Input placeholder="请输入查询网吧名称" />)}
            </FormItem>
          </Col>
          <Col md={6} sm={24}>
            <FormItem label={formatMessage({ id: 'app.netbar.status' })}>
              {getFieldDecorator('status')(
                <Select placeholder="请选择状态" style={{ width: '100%' }}>
                  <Option value="0">生效中</Option>
                  <Option value="1">已过期</Option>
                  <Option value="2">即将到期</Option>
                  <Option value="3">未开通</Option>
                  <Option value="4">试用</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={6} sm={24}>
            <FormItem label={formatMessage({ id: 'app.netbar.geographic' })}>
              {getFieldDecorator('geographic', {
                rules: [
                  {
                    required: false,
                    message: formatMessage({ id: 'app.netbar.geographic-message' }, {}),
                  },
                ],
              })(<GeographicView />)}
            </FormItem>
          </Col>
          <Col md={6} sm={24}>
            <span className={styles.submitButtons}>
              <Button type="primary" htmlType="submit">
                查询
              </Button>
              <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                重置
              </Button>
              <a style={{ marginLeft: 8 }} onClick={this.toggleForm}>
                展开 <Icon type="down" />
              </a>
            </span>
          </Col>
        </Row>
      </Form>
    );
  }

  renderAdvancedForm() {
    console.log('renderAdvancedForm this.props: ', this.props);
    const {
      form: { getFieldDecorator },
      query: { data },
    } = this.props;
    const { time } = this.state;
    console.log('renderAdvancedForm - data: ', data);
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label={formatMessage({ id: 'app.netbar.barname' })}>
              {getFieldDecorator('netbarname')(<Input placeholder="请输入查询网吧名称" />)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label={formatMessage({ id: 'app.netbar.status' })}>
              {getFieldDecorator('status')(
                <Select placeholder="请选择状态" style={{ width: '100%' }}>
                  <Option value="0">生效中</Option>
                  <Option value="1">已过期</Option>
                  <Option value="2">即将到期</Option>
                  <Option value="3">未开通</Option>
                  <Option value="4">试用</Option>
                  <Option value="-1">全部</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label={formatMessage({ id: 'app.netbar.geographic' })}>
              {getFieldDecorator('geographic', {
                rules: [
                  {
                    required: false,
                    message: formatMessage({ id: 'app.netbar.geographic-message' }, {}),
                  },
                  {
                    validator: validatorGeographic,
                  },
                ],
              })(<GeographicView />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label={formatMessage({ id: 'app.netbar.machinenummin' })}>
              {getFieldDecorator('machinenummin')(
                <Input type="number" placeholder="请输入查询最小值，默认为0" />
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label={formatMessage({ id: 'app.netbar.machinenummax' })}>
              {getFieldDecorator('machinenummax')(
                <Input type="number" placeholder="请输入查询最大值，默认为MAX" />
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label={formatMessage({ id: 'app.netbar.proxy' })}>
              {getFieldDecorator('qqno')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label={formatMessage({ id: 'app.netbar.datepicker' })}>
              <RangePicker
                // eslint-disable-next-line no-return-assign
                value={time}
                ranges={{
                  今天: [moment().startOf('day'), moment().endOf('day')],
                  本月: [moment().startOf('month'), moment().endOf('month')],
                }}
                showTime
                format="YYYY/MM/DD"
                // eslint-disable-next-line react/jsx-boolean-value
                onChange={this.onChange}
                onOk={this.onOk}
                // onPanelChange={this.onPanelChange}
              />
            </FormItem>
          </Col>
          <Col md={12} sm={24}>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ marginBottom: 24 }}>
                <Button type="primary" htmlType="submit">
                  查询
                </Button>
                <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                  重置
                </Button>
                <a style={{ marginLeft: 8 }} onClick={this.toggleForm}>
                  收起 <Icon type="up" />
                </a>
              </div>
            </div>
          </Col>
        </Row>
      </Form>
    );
  }

  renderForm() {
    const { expandForm } = this.state;
    return expandForm ? this.renderAdvancedForm() : this.renderSimpleForm();
  }

  renderEffectiveOperation() {
    return (
      <Fragment>
        <a onClick={() => {}}>续费</a>
        <Divider type="vertical" />
        <a href="">变更套餐</a>
        <Divider type="vertical" />
        <a href="">修改IP库</a>
        <Divider type="vertical" />
        <a href="">修改信息</a>
        <Divider type="vertical" />
        <a href="">查看密钥</a>
      </Fragment>
    );
  }

  renderExpireOperation() {
    return (
      <Fragment>
        <a onClick={() => {}}>续费</a>
        <Divider type="vertical" />
        <a href="">修改IP库</a>
        <Divider type="vertical" />
        <a href="">修改信息</a>
        <Divider type="vertical" />
        <a href="">查看密钥</a>
      </Fragment>
    );
  }

  renderExpiresoonOperation() {
    return (
      <Fragment>
        <a onClick={() => {}}>续费</a>
        <Divider type="vertical" />
        <a href="">变更套餐</a>
        <Divider type="vertical" />
        <a href="">修改IP库</a>
        <Divider type="vertical" />
        <a href="">修改信息</a>
        <Divider type="vertical" />
        <a href="">查看密钥</a>
      </Fragment>
    );
  }

  renderNveropenOperation() {
    return (
      <Fragment>
        <a onClick={() => {}}>开通</a>
        <Divider type="vertical" />
        <a href="">修改IP库</a>
        <Divider type="vertical" />
        <a href="">修改信息</a>
        <Divider type="vertical" />
        <a href="">查看密钥</a>
      </Fragment>
    );
  }

  renderTrialOperation() {
    return (
      <Fragment>
        <a onClick={() => {}}>开通</a>
        <Divider type="vertical" />
        <a href="">修改IP库</a>
        <Divider type="vertical" />
        <a href="">修改信息</a>
        <Divider type="vertical" />
        <a href="">查看密钥</a>
      </Fragment>
    );
  }

  renderOperation(text, record) {
    console.log("renderOperation -- text, ", text, " record: ", record);
    var render = () => { };
    // <Option value="0">生效中</Option>
    // <Option value="1">已过期</Option>
    // <Option value="2">即将到期</Option>
    // <Option value="3">未开通</Option>
    // <Option value="4">试用</Option>
    // const statusMap = ['effective', 'expire', 'expiresoon', 'neveropen', 'trial'];
    if (record && record.status!= undefined) {
      switch (record.status) {
        case 0: //  生效中
          render = this.renderEffectiveOperation();
          break;
        case 1: // 已过期
          render = this.renderExpireOperation();
          break;
        case 2: // 即将过期
          render = this.renderExpiresoonOperation();
          break;
        case 3: // 未开通
          render = this.renderNveropenOperation();
          break;
        case 4: // 试用
          render = this.renderTrialOperation();
          break;
        default: // 其他 ，一般不可能发生
          render = () => { };
          break;
      }
    }
    return render;
  }

  render() {
    const {
      query: { data },
      loading,
    } = this.props;
    console.log('data -- render: ', data);
    console.log('this.props', this.props);
    // eslint-disable-next-line no-unused-vars
    const { selectedRows, expandForm } = this.state;
    return (
      <PageHeaderWrapper title="网吧管理">
        <div className={styles.tableList}>
          <div className={styles.tableListForm}>{this.renderForm()}</div>
          <div className="pagewrap">
            <StandardTable
              selectedRows={selectedRows}
              loading={loading}
              data={data}
              columns={this.columns}
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
            />
          </div>
        </div>
      </PageHeaderWrapper>
    );
  }
}

export default NetBar;
