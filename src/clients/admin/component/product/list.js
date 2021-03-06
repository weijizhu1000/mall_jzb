import React from 'react'
import PageList from '../../common/pagelist'
import {Columns, Uri} from "./map"

export default class ProductManage extends React.Component {
    render() {
        return (
          <div>
              <PageList columns={Columns} uri={Uri} location={this.props.location}/>
          </div>
        )
    }
}