import React, { Component } from 'react';
import axios from 'axios';
import { Row, Col, DatePicker, Select, Card, Layout, Input } from 'antd';
import moment from 'moment';
import styled from 'styled-components';
import './App.css';
import momentIterator from 'moment-iterator';
import withLoadingScreen from './LoadingScreen';

const { RangePicker } = DatePicker;
const { Meta } = Card;
const Option = Select.Option;
const Search = Input.Search;

const MainStyled = styled.div`
  margin: 0 auto;
  padding-top: 20px;
  width: 80%;
  .ant-card-actions > li > span {
    display: block;
  }
  .ant-card-actions > li {
    text-align: unset;
  }
  .ant-card {
    background: unset;
  }
  .ant-card-body {
    background: #fff;
  }
  .ant-card-cover img {
    height: 100%;
    width: 100%;
    max-height: 300px;
    object-fit: contain;
  }
`;

const ActionStyled = styled.div`
  * {
    margin-left: 10px;
  }
  img {
    height: 30px;
  }
`;

const ImageStyled = styled.div`
  width: 300px;
  height: 300px;
  max-height: 300px;
  background: url(${props => (props.src ? props.src : '')}) center center
    no-repeat;
`;

const pubs =
  'airbnb,alligator,angular,angular_depth,aws,soundcloud,bit,chromium,codeburst,codecentric,codrops,css_tricks,daily_js,daily,dc,devto,dev_channel,echojs,facebook_code,flutter_com,freecodecamp,gc,github,gcp,hackernoon,infoq,instagram,istio,itnext,jsk,kdnuggets,kotlin,k8s,lambda,ln,lightbend,linkedin,logrocket,medium_js,hacks,msdn,netflix,nodejs,nodesource,npm,pragmatists,quick_code,react,react_native,rpython,risingstack,scotch,sitepen,sitepoint,smashing,softwaremill,spotify,spring,tem,disney,newstack,swlh,vue,tds,tutorialzine,tuts_plus,twitter,web_fundamentals,webkit';

const option = Array.from(Array(10).keys());

const pageSizeOption = Array.from(Array(10).keys())
  .map(i => i * 10)
  .filter(i => i !== 0);

export const Tag = ({ image, title, url, pubImage, pubTitle }) => (
  <Col onClick={() => window.open(url)} style={{ margin: 10 }}>
    <Card
      bordered={false}
      hoverable
      style={{ width: 300 }}
      cover={<img alt="example" src={image} />}
      actions={[
        <ActionStyled>
          <img src={pubImage} alt={pubTitle} />
          <span>/{pubTitle}</span>
        </ActionStyled>
      ]}
    >
      <Meta
        title={
          <a href={url} style={{ whiteSpace: 'initial' }}>
            {title}
          </a>
        }
      />
    </Card>
  </Col>
);

class App extends Component {
  state = {
    latest: moment().toISOString(),
    page: 0,
    pageSize: 30,
    data: [],
    pubs: [],
    source: []
  };

  componentDidMount() {
    try {
      this.callApi(this.state.page, this.state.pageSize, this.state.latest);
    } catch (e) {
      console.log(e);
    }
  }

  async callApi(page, pageSize, latest) {
    this.props.handleLoading(true);
    const { data } = await axios.get('/v1/posts/latest', {
      params: { page, pageSize, pubs, latest }
    });
    this.setState({
      // pubs: [...new Set(data.map(i => i.publication.name))],
      data,
      source: data
    });
    this.props.handleLoading(false);
    return data;
  }

  onChangeDate = async date => {
    await this.callApi(
      this.state.page,
      this.state.pageSize,
      date.toISOString()
    );
    this.setState({ latest: date.toISOString() });
  };

  handleChangePage = async value => {
    this.setState({ page: value });
    await this.callApi(value, this.state.pageSize, this.state.latest);
  };

  handleChangeSize = async value => {
    this.setState({ pageSize: value });
    await this.callApi(this.state.page, value, this.state.latest);
  };

  handleSearch = value => {
    if (value.trim() === '') {
      this.setState({ data: this.state.source });
      return;
    }
    const searchResult = this.state.data.filter(
      v => v.title.toUpperCase().includes(value.toUpperCase()) === true
    );
    this.setState({ data: searchResult });
  };

  onChangeRange = async value => {
    let listDay = [];
    if (value[0].isBefore() && value[1].isBefore()) {
      // for(let m = value[0]; m.diff(value[1], 'days') <= 0;m.add(1, 'days')){
      //   ((i) => listDay.push(i))(m)
      // }
      momentIterator(value[0], value[1]).each('days', e => listDay.push(e));
    }
    console.log(listDay);
    let URLPromises = listDay.map(day => {
      return this.prepareData(0, 100, day.toISOString());
    });
    let responses = await Promise.all(URLPromises);
    let data = responses.flatMap(item => item.data);
    this.setState({ data: this.getUnique(data, 'id') });
  };

  getUnique(arr, comp) {
    const unique = arr
      .map(e => e[comp])

      .map((e, i, final) => final.indexOf(e) === i && i)

      .filter(e => arr[e])
      .map(e => arr[e]);

    return unique;
  }

  prepareData = (page, pageSize, latest) => {
    return axios.get('/v1/posts/latest', {
      params: { page, pageSize, pubs, latest }
    });
  };
  render() {
    return (
      <Layout>
        <MainStyled>
          <Row type="flex" gutter={16} justify="center">
            <Col>Pick Data</Col>
            <Col>
              <RangePicker onChange={this.onChangeRange} />
            </Col>
            <Col lg={8} xs={24}>
              <Search
                placeholder="input search text"
                onSearch={value => this.handleSearch(value)}
                enterButton
              />
            </Col>
          </Row>
          <Row
            type="flex"
            justify="center"
            gutter={16}
            style={{ marginTop: 20 }}
          >
            <Col className="actions">
              <span>Date : </span>
              <DatePicker
                defaultValue={moment()}
                onChange={this.onChangeDate}
              />
            </Col>
            <Col>
              <span>Page : </span>
              <Select
                defaultValue={this.state.page}
                style={{ width: 120 }}
                onChange={this.handleChangePage}
              >
                {option.map(item => (
                  <Option key={`op${item}`} value={item}>
                    {item}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col>
              <span>Page Size : </span>
              <Select
                defaultValue={this.state.pageSize}
                style={{ width: 120 }}
                onChange={this.handleChangeSize}
              >
                {pageSizeOption.map(item => (
                  <Option key={`opSize${item}`} value={item}>
                    {item}
                  </Option>
                ))}
              </Select>
            </Col>

          </Row>
          <Row
            gutter={16}
            type="flex"
            justify="center"
            style={{ marginTop: 20 }}
          >
            {this.state.data &&
              this.state.data.length > 0 &&
              this.state.data.map(item => (
                <Tag
                  key={item.id}
                  image={item.image}
                  url={item.url}
                  title={item.title}
                  pubTitle={item.publication.name}
                  pubImage={item.publication.image}
                />
              ))}
          </Row>
        </MainStyled>
      </Layout>
    );
  }
}

export default withLoadingScreen(App);
// export default App;
