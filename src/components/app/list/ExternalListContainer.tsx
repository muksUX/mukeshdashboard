import React, { Component } from 'react'
import Select, { components } from 'react-select';
import './list.css';
import { Link } from 'react-router-dom';
import { ReactComponent as Edit } from '../../../assets/icons/ic-settings.svg';
import { ReactComponent as Check } from '../../../assets/icons/ic-check.svg';
import { ReactComponent as Dropdown } from '../../../assets/icons/appstatus/ic-dropdown.svg'
import { ReactComponent as Search } from '../../../assets/icons/ic-search.svg';
import { ReactComponent as Clear } from '../../../assets/icons/ic-error.svg';
import { FilterOption, Option, multiSelectStyles } from '../../common';
import { ExternalListContainerState, ExternalListContainerProps } from './types'
import { getExternalList, getNamespaceList, getClusterList } from './External.service'
import { Progressing, showError } from '../../../components/common';
import { ReactComponent as ArrowDown } from '../../../assets/icons/ic-chevron-down.svg';
import * as queryString from 'query-string';
import { URLS, ViewType } from '../../../config';

const QueryParams = {
    Cluster: "cluster",
    Namespace: "namespace",
    Appstore: "appstore"
}

function ExternalFilter({renderExternalSearch}){
    const  MenuList = props => {
        return (
            <components.MenuList {...props}>
                {props.children}
                <div className="chartListApplyFilter flex bcn-0 pt-10 pb-10">
                    <button type="button" style={{ width: "92%" }} className="cta flex cta--chart-store"
                        disabled={false}
                        onClick={(selected: any) => {props.handleSelectedNamespace(selected)}}>Apply Filter</button>
                </div>
            </components.MenuList>
        );
    };
    
    const ValueContainer = props => {
        let length = props.getValue().length;
        let count = ''
        if (length === props.options.length && (props.selectProps.name === 'entityName' || props.selectProps.name === 'environment')) {
            count = 'All'
        }
        else {
            count = length
        }
    
        const Item = props.selectProps.name === 'cluster' ? 'Cluster' : 'Namespace'
        const counting = <span className="badge">{count}</span>
    
        return (
            <components.ValueContainer  {...props}>
                {length > 0 ?
                    <>
                        {!props.selectProps.menuIsOpen && ` ${Item}${length !== 1 ? "s" : ""} ${count}`}
                        {React.cloneElement(props.children[1])}
                    </>
                    : <>{props.children}</>}
            </components.ValueContainer>
        );
    };
    
    const DropdownIndicator = props => {
        return (
            <components.DropdownIndicator {...props}>
                <ArrowDown className={`rotate`} style={{ ['--rotateBy' as any]: props.selectProps.menuIsOpen ? '180deg' : '0deg', height: '24px', width: '24px' }} />
            </components.DropdownIndicator>
        )
    }
     { renderExternalSearch()}
    
    } 

export default class ExternalListContainer extends Component<ExternalListContainerProps, ExternalListContainerState> {

    constructor(props) {
        super(props)

        this.state = {
            view: ViewType.LOADING,
            code: 0,
            loadingData: false,
            collapsed: false,
            externalList: [],
            filters: {
                namespace: [],
                cluster: [],
            },
            selectedNamespace: [],
            searchQuery: "",
            isSearchApplied: false
        }
        this.toggleHeaderName = this.toggleHeaderName.bind(this)
    }

    componentDidMount() {
        getExternalList().then((response) => {
            this.setState({
                externalList: response,
                view: ViewType.FORM
            })
        }).catch((error) => {
            showError(error);
        })

        getNamespaceList().then((response) => {
            let data = response
            let namespaceList = data?.map((list) => {
                return {
                    label: list.label,
                    key: list.key,
                    isSaved: list.isSaved,
                    isChecked: list.isChecked
                }
            })
            this.setState({
                filters: {
                    namespace: namespaceList,
                    cluster: this.state.filters.cluster
                }
            })
        }).catch((error) => {
            showError(error);
        })

        getClusterList().then((response) => {
            let data = response
            let clusterList = data?.map((list) => {
                return {
                    label: list.label,
                    key: list.key,
                    isSaved: list.isSaved,
                    isChecked: list.isChecked
                }
            })
            this.setState({
                ...this.state,
                filters: {
                    namespace: this.state.filters.namespace,
                    cluster: clusterList
                }
            })
        }).catch((error) => {
            showError(error);
        })
    }
    
    toggleHeaderName() {
        this.setState({ collapsed: !this.state.collapsed })
    }

    renderExternalTitle() {
        return <div className="app-header">
            <div className="app-header__title">
                <h1 className="app-header__text flex">External Apps
                <Dropdown onClick={this.toggleHeaderName} className="icon-dim-24 rotate ml-4" style={{ ['--rotateBy' as any]: this.state.collapsed ? '180deg' : '0deg' }} />
                </h1>
                {this.state.collapsed ? <>
                    <div className="app-list-card bcn-0 br-4 en-1 bw-1 pt-8 pr-8 pb-8 pl-8 ">
                        <div className="flex left pt-8 pr-8 pb-8 pl-8 cursor">
                            <Check className="scb-5 mr-8 icon-dim-16" />
                            <div>
                                <div className="cn-9 fs-13">Devtron Apps & Charts</div>
                                <div className="cn-5">Apps & charts deployed using Devtron</div>
                            </div>
                        </div>
                        <div className="flex left pt-8 pr-8 pb-8 pl-8 cursor">
                            <Check className="scb-5 mr-8 icon-dim-16" />
                            <div>
                                <div className="cn-9 fs-13">External Apps</div>
                                <div className="cn-5">Helm charts, Argocd objects</div>
                            </div>
                        </div>
                    </div>
                </> : ""}
            </div>
        </div>
    }

    handleSearchStr = (event: React.ChangeEvent<HTMLInputElement>): void => {
        let str = event.target.value || "";
        str = str.toLowerCase();
        this.setState({ searchQuery: str });
    }


    handleSelectedCluster(selected) {
        let url = this.props.match.url
        let clusterId = selected.map((e) => { return e.value }).join(",");
        let searchParams = new URLSearchParams(this.props.location.search);
        let namespace = searchParams.get(QueryParams.Namespace);
        let appStore = searchParams.get(QueryParams.Appstore)
        let qs = `${QueryParams.Cluster}=${clusterId}`;
        if (namespace) { qs = `${qs}&${QueryParams.Cluster}=${namespace}` };
        if (appStore) { qs = `${qs}&${QueryParams.Appstore}=${appStore}` };
        this.props.history.push(`${url}?${qs}`);
    }

    handleSelectedNamespace(selected) {
        let url = this.props.match.url
        let namespaceId = selected.map((e) => { return e.value }).join(",");
        let searchParams = new URLSearchParams(this.props.location.search);
        let cluster = searchParams.get(QueryParams.Cluster);
        let appStore = searchParams.get(QueryParams.Appstore)
        let qs = `${QueryParams.Namespace}=${namespaceId}`;
        if (cluster) { qs = `${qs}&${QueryParams.Cluster}=${cluster}` };
        if (appStore) { qs = `${qs}&${QueryParams.Appstore}=${appStore}` };
        this.props.history.push(`${url}?${qs}`);
    }

    handleAppStoreChange(event) {
        event.preventDefault();
        let url = this.props.match.url
        let searchParams = new URLSearchParams(this.props.location.search);
        let cluster = searchParams.get(QueryParams.Cluster);
        let namespace = searchParams.get(QueryParams.Namespace);
        let qs = `${QueryParams.Appstore}=${this.state.searchQuery}`;
        if (cluster) qs = `${qs}&${QueryParams.Cluster}=${cluster}`;
        if (namespace) qs = `${qs}&${QueryParams.Namespace}=${namespace}`;
        this.props.history.push(`${url}?${qs}`);
    }

    clearSearch() {
        let url = this.props.match.url
        let searchParams = new URLSearchParams(this.props.location.search);
        let cluster = searchParams.get(QueryParams.Cluster);
        let namespace = searchParams.get(QueryParams.Namespace);
        let qs: string = "";
        if (cluster) qs = `${qs}&${QueryParams.Cluster}=${cluster}`;
        if (namespace) qs = `${qs}&${QueryParams.Namespace}=${namespace}`;
        this.props.history.push(`${url}?${qs}`);
    }

    renderExternalSearch() {
        return <div className="flexbox flex-justify">
            <form
                onSubmit={(e) => this.handleAppStoreChange(e)}
                className="search position-rel" style={{ flexBasis: "100%" }} >
                <Search className="search__icon icon-dim-18" />
                <input className="search__input bcn-1" type="text" placeholder="Search applications"
                    value={this.state.searchQuery}
                    onChange={(event) => { this.setState({ searchQuery: event.target.value }); }}
                />
                {this.state.isSearchApplied ? <button className="search__clear-button" type="button" onClick={this.clearSearch}>
                    <Clear className="icon-dim-18 icon-n4 vertical-align-middle" />
                </button> : null}
            </form>
        </div>
    }

    renderExternalFilters() {
        return <div className="external-list--grid">
            {/* <ExternalFilter renderExternalSearch={this.renderExternalSearch}/> */}
            {/*{this.renderExternalSearch()}
             <Select className="cn-9 fs-14"
                placeholder="Cluster: All"
                name="cluster"
                options={this.state.filters.cluster?.map((env) => ({ label: env.label, value: env.key }))}
                components={{
                    Option,
                    MenuList,
                    ValueContainer,
                    DropdownIndicator,
                    IndicatorSeparator: null,
                }}
                // value={this.state.cluster}
                onChange={(selected: any) => this.handleSelectedCluster(selected)}
                isMulti
                hideSelectedOptions={false}
                closeMenuOnSelect={false}
                styles={{
                    ...multiSelectStyles,
                    control: (base, state) => ({
                        ...base,
                        border: state.isFocused ? '1px solid #06c' : '1px solid #d6dbdf',
                        boxShadow: 'none',
                        height: '36px',
                    }),
                }}
            />
            <Select className="cn-9 fs-14"
                placeholder="Namespace: All"
                options={this.state.filters.namespace?.map((env) => ({ label: env.label, value: env.key }))}
                onChange={(selected: any) =>this.setState({ selectedNamespace: selected}) }
                value={this.state.selectedNamespace}
                name="Namespace"
                components={{
                    Option,
                    MenuList,
                    ValueContainer,
                    IndicatorSeparator: null,
                    DropdownIndicator,
                }}
                isMulti
                hideSelectedOptions={false}
                closeMenuOnSelect={false}
                styles={{
                    ...multiSelectStyles,
                    control: (base, state) => ({
                        ...base,
                        border: state.isFocused ? '1px solid #0066CC' : '1px solid #d6dbdf',
                        boxShadow: 'none',
                        height: '36px',
                        ...base,
                        paddingBottom: "0px"
                    }),
                }}
            />*/}
        </div> 
    }

    renderExternalListHeader() {
        return <div className=" bcn-0 pl-20 pr-20">
            <div className=" pt-12 pb-12">
                {this.renderExternalFilters()}
            </div>
            <div className="external-list__header pt-8 pb-8">
                <div className="external-list__cell pr-12">
                    <button className="app-list__cell-header" onClick={e => { e.preventDefault(); }}> App name
                         {/* {this.props.sortRule.key == SortBy.APP_NAME ? <span className={icon}></span> : <span className="sort-col"></span>} */}
                    </button>
                </div>
                <div className="external-list__cell external-list__cell--width pl-12 pr-12">
                    <span className="app-list__cell-header">Environment</span>
                </div>
                <div className="external-list__cell pl-12 pr-12">
                    <span className="app-list__cell-header ">Last Updated </span>
                </div>
                <div className="app-list__cell app-list__cell--action"></div>
            </div>
        </div>
    }

    removeFilter = (val, type: string): void => {
        let qs = queryString.parse(this.props.location.search);
        let keys = Object.keys(qs);
        let query = {};
        keys.map((key) => {
            query[key] = qs[key];
        })
        query['offset'] = 0;
        let appliedFilters = query[type];
        let arr = appliedFilters.split(",");
        arr = arr.filter((item) => item != val.toString());
        query[type] = arr.toString();
        if (query[type] == "") delete query[type];
        let queryStr = queryString.stringify(query);
        let url = `${URLS.APP}?${queryStr}`;
        this.props.history.push(url);
    }

    renderSavedFilters() {
        let count = 0;
        let keys = Object.keys(this.state.filters);
        let savedFilters = <div className="saved-filters">
            {keys.map((key) => {
                return this.state.filters[key].map((filter) => {
                    if (filter.isChecked) {
                        count++;
                        return <div key={filter.key} className="saved-filter">{filter.label}
                            <button type="button" className="saved-filter__clear-btn"
                                onClick={(event) => this.removeFilter(filter.key, key)} >
                                <i className="fa fa-times-circle" aria-hidden="true"></i>
                            </button>
                        </div>
                    }
                })
            })}
            <button type="button" className="saved-filters__clear-btn" >
                Clear All Filters
            </button>
        </div>
    }

    renderExternalList(list) {

        return (
            <div className="bcn-0">
                <Link to="" className="external-list__row flex left cn-9 pt-19 pb-19 pl-20">
                    <div className="external-list__cell content-left pr-12"> <p className="truncate-text m-0">{list.appname}</p></div>
                    <div className="external-list__cell external-list__cell--width pl-12 pr-12">{list.environment}</div>
                    <div className="external-list__cell pr-12"> {list.lastupdate} </div>
                    <div className="app-list__cell app-list__cell--action">
                        <button type="button" className="button-edit" onClick={(event) => { event.stopPropagation(); event.preventDefault(); }}>
                            <Edit className="button-edit__icon" />
                        </button>
                    </div>
                </Link>
            </div>
        )
    }

    render() {
        return (<>
            {this.renderExternalTitle()}
            {this.renderExternalListHeader()}
            {this.state.view === ViewType.LOADING ? <div style={{ height: "calc(100vh - 280px)" }}> <Progressing pageLoader /> </div>
                : <>
                    {this.renderSavedFilters()}
                    {this.state.externalList.map((list) => { return this.renderExternalList(list) })}
                </>}
        </>
        )
    }
}


