import React, { Component } from 'react';
import axios from 'axios';
import { Row, Col, DatePicker, Select, Card } from 'antd';
import moment from 'moment';
import styled from 'styled-components';
import './App.css';

const { Meta } = Card;
const Option = Select.Option;

const TagStyled = styled.div`
  &:after,&:before{
    clear:both;
  }
`;

const pageSize = 30;
const pubs = "airbnb,alligator,angular,angular_depth,aws,soundcloud,bit,chromium,codeburst,codecentric,codrops,css_tricks,daily_js,daily,dc,devto,dev_channel,echojs,facebook_code,flutter_com,freecodecamp,gc,github,gcp,hackernoon,infoq,instagram,istio,itnext,jsk,kdnuggets,kotlin,k8s,lambda,ln,lightbend,linkedin,logrocket,medium_js,hacks,msdn,netflix,nodejs,nodesource,npm,pragmatists,quick_code,react,react_native,rpython,risingstack,scotch,sitepen,sitepoint,smashing,softwaremill,spotify,spring,tem,disney,newstack,swlh,vue,tds,tutorialzine,tuts_plus,twitter,web_fundamentals,webkit";

const option = Array.from(Array(10).keys())

export const Tag = ({image, title, url}) => (
  <Card
    style={{ width: 300 }}
    cover={<img alt="example" src={image} />}
  >
    <Meta
      title={<a href={url}>{title}</a>}
    />
  </Card>
)

class App extends Component {
  state = {
    latest: moment().toISOString(),
    page: 0,
    pageSize: 30,
    data: []
  }
  async componentDidMount() {
    try {
      const latest = this.state.latest;
      const data = await this.callApi(this.state.page, pageSize, pubs, latest);
      this.setState({ data });
    } catch (e) {
      console.log(e);
    }
  }

  async callApi(page, pageSize, pubs, latest) {
    const { data } = await axios.get("/v1/posts/latest", { params: { page, pageSize, pubs, latest } });
    return data;
  }
  onChangeDate = async (date) => {
    const data = await this.callApi(this.state.page, pageSize, pubs, date.toISOString());
    this.setState({ data, date: date.toISOString() });
  }
  handleChangePage = async (value) => {
    this.setState({ page: value })
    const data = await this.callApi(value, pageSize, pubs, this.state.date);
    this.setState({ data });
  }
  render() {
    return (
      <div className="App">
        <Row type="flex" justify="center" style={{ marginTop: 20 }}>
          <Col className="actions">
            <DatePicker defaultValue={moment()} onChange={this.onChangeDate} ></DatePicker>
            <Select defaultValue="0" style={{ width: 120 }} onChange={this.handleChangePage}>
              {option.map(item => <Option key={`op${item}`} value={item}>{item}</Option>)}
            </Select>
          </Col>
        </Row>
        <Row gutter={16} type="flex">
          {this.state.data && this.state.data.length > 0 && this.state.data.map(item =>
            <Card bordered={false} hoverable>
              <TagStyled>
                <Tag image={item.image} url={item.url} title={item.title}></Tag>
              </TagStyled>
            </Card>
          )}
        </Row>
      </div>
    );
  }
}

export default App;
