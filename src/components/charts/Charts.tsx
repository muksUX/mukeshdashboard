import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import { URLS } from '../../config';
import Deployed from './list/Deployed';
import DeploymentDetail from './deploymentDetail/DeploymentDetail';
import Discover from './list/DiscoverCharts';
import { NavLink } from 'react-router-dom'
import './list/list.scss';
import '../app/details/appDetails/appDetails.scss';
import './charts.css';

export default function Charts() {
    return <Switch>
        <Route path={`${URLS.CHARTS}/deployments/:appId(\\d+)/env/:envId(\\d+)`} component={DeploymentDetail} />
        <Route path={`${URLS.CHARTS}/discover`} component={Discover} />
        <Route path={`${URLS.CHARTS}/deployed`} component={Deployed} />
        <Redirect to={`${URLS.CHARTS}/deployed`} />
    </Switch>
}

 function GenericChartsHeader({ children=null }) {
    return (
        <div className="page-header page-header--tabs">
            {children}
        </div>)
}

export function ChartDetailNavigator() {
    return (
        <ul role="tablist" className="tab-list pl-24 pr-24">
            <li className='tab-list__tab'>
                <NavLink replace to="deployed" className="tab-list__tab-link" activeClassName="active">Deployed</NavLink>
            </li>
            <li className='tab-list__tab'>
                <NavLink replace to="discover" className="tab-list__tab-link" activeClassName="active">Discover</NavLink>
            </li>
        </ul>
    )
}

export function HeaderTitle({ children=null }) {
    return <h1 className="m-0 fs-20 cn-9 fw-6 flex left">{children}</h1>
}

export function HeaderSubtitle({ children=null }) {
    return <div className="subtitle">{children}</div>
}

export function HeaderButtonGroup({ children=null }) {
    return <div className="page-header__cta-container flex right">
        {children}
    </div>
}