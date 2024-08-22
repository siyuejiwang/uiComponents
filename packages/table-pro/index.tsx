import { Table } from 'antd';
import ITableProps from "./dto";
import React from 'react';
export default function FyTable(props: ITableProps) {
    const {title, ...others} = props;
    return <div><p>{title || "pro Table test"}</p><Table {...others} /></div>;
}