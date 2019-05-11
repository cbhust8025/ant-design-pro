import React, { PureComponent } from 'react';
import { Select, Spin } from 'antd';
import { connect } from 'dva';
import styles from './GeographicView.less';

const { Option } = Select;

const nullSlectItem = {
  label: '',
  key: '',
};

@connect(({ geographic }) => {
  const { province, isLoading, city } = geographic;
  return {
    province,
    city,
    isLoading,
  };
})
class GeographicView extends PureComponent {
  componentDidMount = () => {
    // console.log("GeographicView: componentDidMount this.props", this.props);
    const { dispatch } = this.props;
    dispatch({
      type: 'geographic/fetchProvince',
    });
  };

  componentDidUpdate(props) {
    // console.log("GeographicView: componentDidUpdate this.props", this.props);
    const { dispatch, value } = this.props;

    if (!props.value && !!value && !!value.province) {
      dispatch({
        type: 'geographic/fetchCity',
        payload: value.province.key,
      });
    }
  }

  getProvinceOption() {
    // console.log("GeographicView: getProvinceOption this.props", this.props);
    const { province } = this.props;
    return this.getOption(province);
  }

  getCityOption = () => {
    // console.log("GeographicView: getCityOption this.props", this.props);
    const { city } = this.props;
    return this.getOption(city);
  };

  getOption = list => {
    if (!list || list.length < 1) {
      return (
        <Option key={0} value={0}>
          没有找到选项
        </Option>
      );
    }
    return list.map(item => (
      <Option key={item.id} value={item.id}>
        {item.name}
      </Option>
    ));
  };

  selectProvinceItem = item => {
    // console.log("GeographicView: selectProvinceItem this.props", this.props);
    const { dispatch, onChange } = this.props;
    dispatch({
      type: 'geographic/fetchCity',
      payload: item.key,
    });
    onChange({
      province: item,
      city: nullSlectItem,
    });
  };

  selectCityItem = item => {
    // console.log("GeographicView: selectCityItem this.props", this.props);
    const { value, onChange } = this.props;
    onChange({
      province: value.province,
      city: item,
    });
  };

  conversionObject() {
    // console.log("GeographicView: conversionObject this.props", this.props);
    const { value } = this.props;
    if (!value) {
      return {
        province: nullSlectItem,
        city: nullSlectItem,
      };
    }
    const { province, city } = value;
    return {
      province: province || nullSlectItem,
      city: city || nullSlectItem,
    };
  }

  render() {
    const { province, city } = this.conversionObject();
    const { isLoading } = this.props;
    // console.log("GeographicView: conversionObject this.props", this.props);
    // console.log("isLoading: ", isLoading);
    // console.log("province: ", province, "  city: ", city);
    return (
      <Spin spinning={isLoading} wrapperClassName={styles.row}>
        <Select
          className={styles.item}
          value={province}
          labelInValue
          showSearch
          onSelect={this.selectProvinceItem}
        >
          {this.getProvinceOption()}
        </Select>
        <Select
          className={styles.item}
          value={city}
          labelInValue
          showSearch
          onSelect={this.selectCityItem}
        >
          {this.getCityOption()}
        </Select>
      </Spin>
    );
  }
}

export default GeographicView;
