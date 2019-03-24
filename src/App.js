import React, { Component } from 'react';
import axios from 'axios';
import { Row, Col, DatePicker, Select, Card, Layout } from 'antd';
import moment from 'moment';
import styled from 'styled-components';
import './App.css';

const { Meta } = Card;
const Option = Select.Option;

const MainStyled = styled.div`
  margin: 0 auto;
  width: 80%;
  .ant-card-actions > li > span{
    display: block;
  }
  .ant-card-actions > li{
    text-align: unset;
  }
   .ant-card{
    background: unset;
  }
  .ant-card-body{
    background: #fff;
  }
`;

const ActionStyled = styled.div`
  *{
    margin-left: 10px;
  }
  img{
    height: 30px;
  }
`;

const pubs = "airbnb,alligator,angular,angular_depth,aws,soundcloud,bit,chromium,codeburst,codecentric,codrops,css_tricks,daily_js,daily,dc,devto,dev_channel,echojs,facebook_code,flutter_com,freecodecamp,gc,github,gcp,hackernoon,infoq,instagram,istio,itnext,jsk,kdnuggets,kotlin,k8s,lambda,ln,lightbend,linkedin,logrocket,medium_js,hacks,msdn,netflix,nodejs,nodesource,npm,pragmatists,quick_code,react,react_native,rpython,risingstack,scotch,sitepen,sitepoint,smashing,softwaremill,spotify,spring,tem,disney,newstack,swlh,vue,tds,tutorialzine,tuts_plus,twitter,web_fundamentals,webkit";

const option = Array.from(Array(10).keys())

const pageSizeOption = Array.from(Array(10).keys()).map(i => i * 10).filter(i => i !== 0)

export const Tag = ({ image, title, url, pubImage, pubTitle }) => (
  <Card
    style={{ width: 300 }}
    cover={<img alt="example" src={image} />}
    actions={[<ActionStyled><img src={pubImage} alt={pubTitle} /><span>/{pubTitle}</span></ActionStyled>]}
  >
    <Meta
      title={<a href={url} style={{ whiteSpace: "initial" }}>{title}</a>}
    />
  </Card>
)

class App extends Component {
  state = {
    latest: moment().toISOString(),
    page: 0,
    pageSize: 30,
    data: [],
    pubs: []
  }
  async componentDidMount() {
    try {
      const data = await this.callApi(this.state.page, this.state.pageSize, pubs, this.state.latest);
    } catch (e) {
      console.log(e);
    }
  }

  async callApi(page, pageSize, pubs, latest) {
    const { data } = await axios.get("/v1/posts/latest", { params: { page, pageSize, pubs, latest } });
    this.setState({ pubs: [...new Set(data.map(i => i.publication.name))], data })
    return data;
  }
  onChangeDate = async (date) => {
    await this.callApi(this.state.page, this.state.pageSize, pubs, date.toISOString());
    this.setState({ date: date.toISOString() });
  }
  handleChangePage = async (value) => {
    this.setState({ page: value })
    await this.callApi(value, this.state.pageSize, pubs, this.state.latest);
  }
  handleChangeSize = async (value) => {
    this.setState({ pageSize: value })
    await this.callApi(this.state.page, value, pubs, this.state.latest);
  }
  render() {
    return (
      <Layout>
        <MainStyled>
          <Row type="flex" justify="center" style={{ marginTop: 20 }}>
            <Col className="actions">
              <span>Date : </span>
              <DatePicker defaultValue={moment()} onChange={this.onChangeDate} ></DatePicker>
              <span>Page : </span>
              <Select defaultValue={this.state.page} style={{ width: 120 }} onChange={this.handleChangePage}>
                {option.map(item => <Option key={`op${item}`} value={item}>{item}</Option>)}
              </Select>
              <span>Page Size : </span>
              <Select defaultValue={this.state.pageSize} style={{ width: 120 }} onChange={this.handleChangeSize}>
                {pageSizeOption.map(item => <Option key={`opSize${item}`} value={item}>{item}</Option>)}
              </Select>
            </Col>
          </Row>
          <Row gutter={16} type="flex" justify="center" style={{ marginTop: 20 }}>
            {this.state.data && this.state.data.length > 0 && this.state.data.map(item =>
              <Card bordered={false} hoverable key={item.id}>
                <Tag image={item.image} url={item.url} title={item.title} pubTitle={item.publication.name} pubImage={item.publication.image}></Tag>
              </Card>
            )}
          </Row>
        </MainStyled>
      </Layout>
    );
  }
}

export default App;
