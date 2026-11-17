import {useUi} from '@realiz3r/worka-react';
import {ui} from './messages';
import {Link, type RouteObject} from 'react-router';
import {PreviewLayout} from './view-expanded';

function NotFound() {useUi(ui);return <p role="alert">{ui("页面不存在，请返回预览首页。")} <Link to="..">{ui('返回首页')}</Link></p>;}

export const routes = [{element: <PreviewLayout />, children: [
  {index: true, element: null},
  {path: 'candidates/:candidateId', element: null},
  {path: '*', element: <NotFound />},
]}] satisfies RouteObject[];
