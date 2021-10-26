import React, { Component } from "react";
import Select from 'react-select'
// import { Editor } from "react-draft-wysiwyg";
import { EditorState, convertToRaw ,convertFromHTML,ContentState} from "draft-js";
import {
  getBotStatusList,
  getConfigFileDetail,
  getModuleTypeNames,
  getFileTypeNames,
  saveConfigFile,
  saveScriptFile,
  getConfigFileList,
  getBotConfigList,
  getBotConfigFileList,
  updateBotStatus,
  getIndicatorSignallingList,
} from "api/Api";
import {
  Button
} from "reactstrap";
import { MDBBtn } from "mdbreact";

import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';

import Modal from 'react-bootstrap/Modal'
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import { MDBDataTableV5 } from 'mdbreact';
import moment from 'moment'
import "./Editor.css"

export default class TextEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      code: '',
      key: 'parameter',
      editorState: EditorState.createEmpty(),
      textdata:["hello"],
      scriptfiles: [],
      scriptfile: null,
      selectedFileType: null,
      selectedModuleType: null,
      selectedModule1Type: null,
      module1TypeOptions: [
        { value: 'watchlists', label: 'watchlists' },
        { value: 'indicator_signaling', label: 'indicator_signaling' },
        { value: 'order_signalling', label: 'order_signalling' },
        { value: 'order_routing', label: 'order_routing' },
        { value: 'indicators', label: 'pass in processed data into indicators' },
        { value: 'core', label: 'core' },
      ],
      processConfigOptions: {
        bot_name: '',

        indicator: [
          {
            value: 'heik_diff',
            label: 'heik_diff'
          },
          {
            value: 'heik',
            label: 'heik'
          },
          {
            value: 'rsi1',
            label: 'rsi1'
          },
          {
            value: 'rsi2',
            label: 'rsi2'
          },
          {
            value: 'rsi3',
            label: 'rsi3'
          },
        ],
        watchlist: [
          {
            value: 'tech',
            label: 'tech'
          },
          {
            value: 'buffett',
            label: 'buffett'
          },
        ],
        position_sizing: [{value: 'equal', label: 'equal'}],
        order_routing: [
          {
            value: 'alphaca',
            label: 'alphaca'
          },
        ],
        data_source: [{
          label: "polygon",
          value: "polygon"
        }],
        live_trading: [
          {
            value: true,
            label: 'true'
          },
          {
            value: false,
            label: 'false'
          },
        ],
        starting_cash: 10000,
        extended_hours: [
          {value: true, label: 'true'},
          {value: false, label: 'false'}
        ],
        macro_strategy: [{value: 'tsrh_dc', label: 'tsrh_dc'}],
        indicator_signalling: [
          {
            label: "alternative",
            value: "alternative"
          },
          {
            value: 'default',
            label: 'default'
          }
        ],
        asset_class: [
          {
            label: "crypto",
            value: "crypto"
          },
          {
            label: "equities",
            value: "equities"
          }
        ],
      },
      botConfigOptions: {
        bot_name_config: '',
        extended_hours_config: [
          {value: true, label: 'true'},
          {value: false, label: 'false'}
        ],
        macro_strategy_config: [],
        start_date_config: ''
      },
      processConfigSetting: {
        bot_name: '',
        timeframe: null,
        indicator: null,
        watchlist: null,
        position_sizing: null,
        order_routing: null,
        data_source: null,
        live_trading: null,
        starting_cash: 10000,
        extended_hours: null,
        name: '',
        macro_strategy: null,
        indicator_signalling: null,
        asset_class: null,
      },
      botConfigSetting: {
        bot_name_config: '',
        extended_hours_config: null,
        macro_strategy_config: null,
        start_date_config: ''
      },
      selectedConfigFile: null,
      selectedBotConfigFile: null,
      selectedModuleContents: [],
      filename: '',
      file:[],
      content: null,
      isUpdate: false,
      isShowOpenModal: false,
      isShowAddIndicatorModal: false,
      isShowSaveModal: false,
      isCheckedStrategy: false,
      isShowConfigOpenModal: false,
      isShowBotConfigOpenModal: false,
      strategyIndicators: [],
      headerColumnsBotStatus: [
        {
          label: 'ID',
          field: 'id',
          width: 100,
          attributes: {
            'aria-controls': 'DataTable',
            'aria-label': 'symbol',
          },
        },
        {
          label: 'BOT NAME',
          field: 'name',
          width: 200,
        },
        {
          label: 'STATUS',
          field: 'status',
          width: 150,
        },
        {
          label: 'UPDATED',
          field: 'updated',
          width: 150,
        },
        {
          label: 'Action',
          field: 'action',
          sort: false,
          width: 100,
        }
      ],
      headerColumnsBotConfig: [
        {
          label: 'ID',
          field: 'id',
          wdith: 100,
          attributes: {
            'aria-controls': 'DataTable',
            'aria-label': 'ID',
          },
        },
        {
          label: 'BOT NAME',
          field: 'name',
          width: 200,
        },
        {
          label: 'Time Frame',
          field: 'timeframe',
          with: 200,
        },
        {
          label: 'Indicator',
          field: 'indicator',
          with: 500,
        },
        {
          label: 'Watch List',
          field: 'watchlist',
          with: 100,
        },
        {
          label: 'Position Sizing',
          field: 'position_sizing',
          sort: false,
          with: 100,
        },
        {
          label: 'Order Routing',
          field: 'order_routing',
          sort: false,
          with: 100,
        },
        {
          label: 'Data Source',
          field: 'data_source',
          sort: false,
          with: 100,
        },
        {
          label: 'Live Trading',
          field: 'live_trading',
          sort: false,
          with: 100,
        },
        {
          label: 'Starting Cash',
          field: 'starting_cash',
          sort: false,
          with: 100,
        },
        {
          label: 'Hours',
          field: 'hours',
          sort: false,
          with: 100,
        },
        {
          label: 'Macro Strategy',
          field: 'macro_strategy',
          sort: false,
          with: 100,
        },
        {
          label: 'Indicator Signalling',
          field: 'indicator_signalling',
          sort: false,
          with: 100,
        },
        {
          label: 'Asset Class',
          field: 'asset_class',
          sort: false,
          with: 100,
        }
      ],
      headerColumnsSmallBotConfig: [
        {
          label: 'ID',
          field: 'id',
          wdith: 100,
          attributes: {
            'aria-controls': 'DataTable',
            'aria-label': 'ID',
          },
        },
        {
          label: 'BOT NAME',
          field: 'name',
          width: 200,
        },
        {
          label: 'Macro Strategy',
          field: 'macro_strategy',
          sort: false,
          with: 100,
        },
        {
          label: 'Extended Hours',
          field: 'hours',
          sort: false,
          with: 100,
        },
        {
          label: 'Start Date',
          field: 'start_date',
          sort: false,
          with: 100,
        }
      ],
      botStatusDatatable: {
        columns: [],
        rows: [],
      },
      botConfigDatatable: {
        columns: [],
        rows: [],
      },
      botConfigSmallDatatable: {
        columns: [],
        rows: [],
      }
    };


  }

  openAddIndicatorModal = () => {
    this.setState({ isShowAddIndicatorModal: true });
  }

  handleChange = (checked) => {
    this.setState({ isCheckedStrategy: checked });
  }


  async componentDidMount () {
    // loading indicator signalling options
    await this.loadIndicatorSignallingOptions()

    this.loadModuleTypes()
    this.loadConfigFiles()
    this.loadBotConfigFiles()
    this.loadBotStatusList()
    this.loadBotConfigList()
  }

  async loadIndicatorSignallingOptions() {
    const res = await getIndicatorSignallingList();

    if (res.success) {
      //this.state.processConfigOptions.
      let updatedState = this.state
      updatedState.processConfigOptions.indicator_signalling = res.data

      this.setState((state, props) => (updatedState));
    }
  }

  loadConfigFiles = async () => {
    const res = await getConfigFileList('bot_configs');
    if (res.success) {
      const configFiles = res.result.map(value => {
        return {
          value: value,
          label: value
        }
      })

      this.setState({
        configFileOptions: configFiles,
        selectedConfigFile: configFiles[0],
        isUpdate: true,
      })
    }
  }

  loadBotConfigFiles = async () => {
    const res = await getBotConfigFileList('bot_configs');
    if (res.success) {
      const configFiles = res.result.map(value => {
        return {
          value: value,
          label: value
        }
      })

      this.setState({
        botConfigFileOptions: configFiles,
        selectedBotConfigFile: configFiles[0],
        isUpdate: true,
      })
    }
  }

  updateBotStatus = async (bot, action) => {
    const res = await updateBotStatus(bot.name, action)
    alert(res.message)
    await this.loadBotStatusList()
  }

  loadBotStatusList = async () => {
    const res = await getBotStatusList();
    if (res.success) {
      const botStatusList = res.result.map((bot, index) => ({
        id: index + 1,
        name: bot.name,
        status: bot.status,
        updated: moment(bot.updated).format("YYYY-MM-DD h:mm:ss"),
        action: <>
          <MDBBtn className="mr-10" color="blue" size="sm" onClick={
            () => {
              this.updateBotStatus(bot, bot.status === 'live' ? 'pause' : 'start');
            }}
          >
            {bot.status === 'live' ? 'pause' : 'start'}
          </MDBBtn>
          <MDBBtn color="blue" size="sm" onClick={
            () => {
              this.updateBotStatus(bot, 'kill');
            }}
          >
            kill
          </MDBBtn>
        </>
      }))
      const data = {
        columns: this.state.headerColumnsBotStatus,
        rows: botStatusList
      }
      this.setState({
        botStatusDatatable: data
      })
    } else {
      const data = {
        columns: this.state.headerColumnsBotStatus,
        rows: []
      }
      this.setState({
        botStatusDatatable: data
      })
    }
  }

  loadBotConfigList = async () => {
    const res = await getBotConfigList();
    if (res.result) {
      const botConfigList = res.result.map((bot, index) => ({
        id: index + 1,
        bot_name: bot.bot_name,
        timeframe: bot.timeframe,
        indicator: bot.indicator,
        watchlist: bot.watchlist,
        position_sizing: bot.position_sizing,
        order_routing: bot.order_routing,
        data_source: bot.data_source,
        live_trading: bot.live_trading,
        starting_cash: bot.starting_cash,
        hours: bot.extended_hours,
        name: bot.name,
        macro_strategy: bot.macro_strategy,
        indicator_signalling: bot.indicator_signalling,
        asset_class: bot.asset_class,
      }))
      const data = {
        columns: this.state.headerColumnsBotConfig.map((col, index) => {
          if (index === 0) {
            col.width = 50;
          } else if (index === 1) {
            col.width = 150;
          } else if (index === 3) {
            col.width = 300;
          } else if ((index === 4) || (index === 5) || (index === 6) || (index === 7) || (index === 8) || (index === 9)) {
            col.width = 150;
          } else if ((index === 10) || (index === 11) || (index === 12) || (index === 13)) {
            col.width = 200;
          }
          return col;
        }),
        rows: botConfigList
      }
      const data1 = {
        columns: this.state.headerColumnsSmallBotConfig.map((col, index) => {
          if (index === 0) {
            col.width = 50;
          } else if (index === 1) {
            col.width = 150;
          } else if (index === 3) {
            col.width = 300;
          } else if ((index === 4) || (index === 5) || (index === 6) || (index === 7) || (index === 8) || (index === 9)) {
            col.width = 150;
          } else if ((index === 10) || (index === 11) || (index === 12) || (index === 13)) {
            col.width = 200;
          }
          return col;
        }),
        rows: botConfigList
      }
      this.setState({
        botConfigDatatable: data,
        botConfigSmallDatatable: data1
      })
    }
  }

  loadModuleTypes = async () => {
    const res = await getModuleTypeNames();
    if (res.success) {
      const moduleTypes = res.result.map(value => {
        return {
          value: value,
          label: value
        }
      })

      this.setState({
        moduleTypeOptions: moduleTypes,
        selectedModuleType: moduleTypes[0],
        isUpdate: true,
      })
    }
  }

  handleScriptFileChange = (e) => {
    this.setState({
      selectedFileType: e,
      filename: e.value,
    });
  }

  handleScriptFileSave = async () => {
    if (!this.state.filename) {
      alert("Please input the file name!")
      return;
    }

    if (!this.state.code.length) {
      alert("File content is empty!")
      return;
    }



    if (!this.state.isSelectedStrategyFile) {
      if (this.state.isCheckedStrategy) {
        console.log("content is empty!")
        return;
      }
    }

    let res;
    if (this.state.isSelectedStrategyFile) {
      res = await saveScriptFile(
        this.state.filename,
        this.state.code,
        this.state.isUpdate,
        this.state.isCheckedStrategy
      )
      console.log("res?????????????????????????????????????", res)
    } else {
      res = await saveConfigFile(
        this.state.isUpdate ? this.state.selectedFileType.value : this.state.filename,
        this.state.processConfigSetting,
        this.state.isUpdate,
      )
    }

    if (res.success) {
      this.SaveScriptModalClose()
      return;
    }
    alert(res.message);
  }

  handleScriptFileNameChange = (e) => {
    this.setState({
      filename: e.target.value
    })
  }

  onEditorStateChange = (editorState) => {
    this.setState({
      editorState,
    });
  };

  handleScriptFileCreate = async () => {
    this.setState({
      isUpdate: false,
      scriptfiles: null,
      filename: '',
      selectedFileType: null,
      editorState: EditorState.createEmpty(),
    })
  }

  handleOpenScriptFile = async () => {
    this.setState({
      isShowOpenModal: true,
      isUpdate: true,
    })
  }

  handleOpenProcessConfigModal = async () => {
    this.setState({
      isShowConfigOpenModal: true,
      isUpdate: true
    })
  }

  handleFileTypeChange = async (e) => {
    this.setState({
      selectedFileType: e,
      isUpdate: true,
    })
  }

  handleFile1TypeChange = async (e) => {
    this.setState({
      selectedFile1Type: e,
      isUpdate: true,
    })
  }

  handleConfigFileChange = async (e) => {
    this.setState({
      selectedConfigFile: e,
      isUpdate: true,
    })
  }

  handleBotConfigFileChange = async (e) => {
    this.setState({
      selectedBotConfigFile: e,
      isUpdate: true,
    })
  }

  handleModuleTypeChange = async (e) => {
    this.setState({
      selectedModuleType: e,
      isUpdate: true,
    })

    const res = await getFileTypeNames(e.value);
    if (res.success) {
      const fileTypes = res.result.map(value => {
        return {
          value: value.name,
          label: value.name
        }
      })

      this.setState({
        selectedModuleContents: res.result,
        fileTypeOptions: fileTypes,
        selectedFileType: fileTypes[0],
        isUpdate: true,
      })
    }
  }

  handleModule1TypeChange = async (e) => {
    this.setState({
      selectedModule1Type: e,
      isUpdate: true,
    })

    const res = await getFileTypeNames(e.value);
    if (res.success) {
      const fileTypes = !res.result.length ? null :
      res.result.map(value => {
        return {
          value: value.name,
          label: value.name
        }
      })

      this.setState({
        selectedModuleContents: res.result,
        file1TypeOptions: fileTypes,
        selectedFile1Type: fileTypes ? fileTypes[0] : null,
        isUpdate: true,
      })
    }
  }

  handleSaveModalShow = async () => {
    this.setState({isShowSaveModal: true})
  }

  processConfigModalClose = () => {
    this.setState({isShowConfigOpenModal: false})
  }

  botConfigModalClose = () => {
    this.setState({isShowBotConfigOpenModal: false})
  }

  OpenScriptModalClose = () => {
    this.setState({isShowOpenModal: false})
  }

  AddIndicatorModalClose = () => {
    this.setState({ isShowAddIndicatorModal: false })
  }

  SaveScriptModalClose = () => {
    this.setState({isShowSaveModal: false})
  }

  handleScriptFileOpen = async () => {
    const selectedFile = this.state.selectedModuleContents.filter((file) => file.name === this.state.selectedFileType.value)
    const blocksFromHTML = convertFromHTML(selectedFile[0] ? `<pre>${selectedFile[0].contents}</pre>` : '');
    const blockContent= ContentState.createFromBlockArray(
      blocksFromHTML.contentBlocks,
      blocksFromHTML.entityMap,
    );

    this.setState({
      code: selectedFile[0].contents,
      editorState: EditorState.createWithContent(blockContent),
      scriptfile: selectedFile,
    })

    this.OpenScriptModalClose();

  }

  handleConfigFileOpen = async () => {
    const res = await getConfigFileDetail('bot_configs', this.state.selectedConfigFile.value)

    this.setState({
      processConfigSetting: res,
      isUpdate: true
    })
    this.processConfigModalClose()
  }

  handleBotConfigFileOpen = async () => {
    const res = await getConfigFileDetail('bot_configs', this.state.selectedConfigFile.value)

    this.setState({
      botConfigSetting: {
        bot_name_config: res.bot_name,
        macro_strategy_config: res.macro_strategy,
        start_date_config: res.start_date_config,
        extended_hours_config: res.extended_hours,
      },
      isUpdate: true
    })

    this.botConfigModalClose()
  }

  handleSave = (editorState) => {
    let content = convertToRaw(editorState.getCurrentContent())
    this.setState({
      content: content.blocks[0].text,
      isSelectedStrategyFile: true
    })
    this.handleSaveModalShow()
  }

  handleProcessConfigSettingSave = async () => {
    if (!this.state.processConfigSetting.name.length) {
      alert("name field is required!")
      return
    }

    const res = await saveConfigFile(
      this.state.processConfigSetting,
      this.state.isUpdate,
    )

    if (res.success) {
      alert(res.message)
    } else {
      alert('The config is not saved')
    }

    this.loadConfigFiles()
    this.loadBotConfigList()
  }

  showFile = async (e) => {
    e.preventDefault()
    let currFile=e.target.files[0]
    const reader = new FileReader()
    reader.onload = async (e) => {
      const text = (e.target.result)
      const blocksFromHTML = convertFromHTML(text);
      const state= ContentState.createFromBlockArray(
        blocksFromHTML.contentBlocks,
        blocksFromHTML.entityMap,
      );
      this.setState({editorState: EditorState.createWithContent(state),file:currFile})
    };
    reader.readAsText(e.target.files[0])
  }

  handleModuleAndTypeSelect = () => {
    const indicators = this.state.strategyIndicators;
    indicators.push(`${this.state.selectedModule1Type.value}-${this.state.selectedFile1Type.value}`)
    this.setState( { strategyIndicators: indicators} )
  }

  handleIndicatorDelete = (indicator) => {
    let indicators = this.state.strategyIndicators;
    indicators = indicators.filter( (o) => o !== indicator )
    this.setState( { strategyIndicators: indicators} )
  }

  handleBotNameChange = (e, key) => {
    this.state.processConfigSetting[key] = e.target.value
    this.setState({processConfigSetting: this.state.processConfigSetting})
  }


  handleProcessChange = (e, key) => {
    this.state.processConfigSetting[key] = e
    this.setState({processConfigSetting: this.state.processConfigSetting})
  }

  handleBotConfigBotNameChange = (e, key) => {
    this.state.botConfigSetting[key] = e.target.value
    this.setState({botConfigSetting: this.state.botConfigSetting})
  }

  handleBotConfigInputChange = (e, key) => {
    this.state.botConfigSetting[key] = e.target.value
    this.setState({botConfigSetting: this.state.botConfigSetting})
  }

  displayProcessEditor = () => {
    let keys = Object.keys(this.state.processConfigOptions);

    return keys.map((key, index) => {
      return (
        <li key={key} className="list-group-item strategy-indicator-edit-list">
          <div className="strategy-indicator-edit-list-no display-flex-j-c">
            <MDBBtn tag="a" size="sm">
              {index}
            </MDBBtn>
          </div>
          <div className="strategy-indicator-edit-list-content ml-30">
            <MDBBtn tag="a" size="sm"  className="hunter-process-mdb-btn">
              {key}
            </MDBBtn>
          </div>
          <div className="strategy-indicator-edit-list-action">
            {console.log('key:', key)}
          {console.log(this.state.processConfigOptions[key])}
          { key === 'bot_name' || key === 'name' || key === 'starting_cash'
            ?
            (
              <input
                  type="name"
                  className="form-control hunter-bot-name-input"
                  placeholder= {
                    key === 'bot_name' ? "Enter bot name" : key === 'name' ? "Enter name" : "Enter starting cash"
                  }
                  value={this.state.processConfigSetting[key]}
                  onChange={(e) => { this.handleBotNameChange(e, key)}}
              />
            )
            :
            (<Select
              value={this.state.processConfigSetting[key]}
              onChange={(e) => { this.handleProcessChange(e, key) }}
              options={this.state.processConfigOptions[key]}
              placeholder="select"
              isMulti
            />)
          }
          </div>
        </li>
      )
    })
  }

  handleIndicatorReset = () => {
    this.setState(
      {
        processConfigSetting: {
          bot_name: '',
          timeframe: null,
          indicator: null,
          watchlist: null,
          position_sizing: null,
          order_routing: null,
          data_source: null,
          live_trading: null,
          starting_cash: 10000,
          hours: null,
          name: '',
          macro_strategy: null,
          indicator_signalling: null,
          asset_class: null,
        }
      }
    )
  }

  render() {
    const { editorState } = this.state;
    return (
      <React.Fragment>
        <div className="hunter-textedit-container" >
          <Tabs
            id="controlled-tab-example"
            activeKey={this.state.key}
            onSelect={(k) => this.setState({ key: k })}
            className="mb-3"
          >
            <Tab eventKey="parameter" title="Parameter Editor">
              <div className="hunter-code-editor-area">
                <Editor
                  value={this.state.code}
                  onValueChange={code => this.setState({ code })}
                  highlight={code => highlight(code, languages.plaintext)}
                  padding={10}
                  style={{
                    fontFamily: '"Fira code", "Fira Mono", monospace',
                    fontSize: 12,
                    minHeight: "500px",
                    backgroundColor: "#FFFFFF",
                  }}
                />
              </div>
              <div className="hunter-editor-button-area">
                <div className="display-flex-left">
                  <button className="btn btn-md btn-secondary" onClick={()=>this.handleScriptFileCreate()}>New</button>
                  <button className="btn btn-md btn-secondary" onClick={()=>this.handleOpenScriptFile()}>Open</button>
                  {/* <button className="btn btn-md btn-secondary" onClick={()=>this.handleSave(draftToHtml(convertToRaw(editorState.getCurrentContent())))}>Save</button> */}
                  <button className="btn btn-md btn-secondary" onClick={()=>this.handleSave(editorState)}>Save</button>
                </div>
              </div>
            </Tab>
            <Tab eventKey="process" title="Process Config Editor">
              <div className={"strategy-indicator-edit-area"}>
                <ul className="list-group">
                  {this.displayProcessEditor()}
                </ul>
                <div className="strategy-edit-icon-area">
                  <button className="btn btn-md btn-secondary mr-10" onClick={()=>this.handleIndicatorReset()}>Reset</button>
                  <button className="btn btn-md btn-secondary mr-10" onClick={()=>this.handleOpenProcessConfigModal()}>Open</button>
                  <button className="btn btn-md btn-secondary mr-10" onClick={()=>this.handleProcessConfigSettingSave()}>Save</button>
                </div>
              </div>
            </Tab>
            <Tab eventKey="bot-status-manager" title="Bot Status Manager">
            <MDBDataTableV5
              hover
              maxHeight="500px"
              data={this.state.botStatusDatatable}
              dark={true}
              noBottomColumns={true}
              small={true}
              striped={true}
              scrollY={true}
            />;
            </Tab>
            {/* <Tab eventKey="bot-config-manager-small" title="Bot Config Manager1">
              <MDBDataTableV5
                hover
                maxHeight="500px"
                data={this.state.botConfigSmallDatatable}
                noBottomColumns={true}
                small={true}
                sortable={false}
                striped={true}
                scrollX
              />;
            </Tab> */}
            <Tab eventKey="bot-config-manager" title="Bot Config Manager">
              <MDBDataTableV5
                hover
                maxHeight="500px"
                data={this.state.botConfigDatatable}
                noBottomColumns={true}
                small={true}
                sortable={false}
                striped={true}
                scrollX
              />;
            </Tab>
          </Tabs>
          <Modal show={this.state.isShowOpenModal} className="hunter-modal" onHide={this.OpenScriptModalClose}>
            <Modal.Header closeButton>
              <Modal.Title>Open Script File</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="hunter-select-module-area">
                <div className="select-multi-option">
                  <label>Select module type</label>
                  <Select
                    className="hunter-module-type-select"
                    name="select-module-type"
                    placeholder="Module Type"
                    value={this.state.selectedModuleType}
                    onChange={this.handleModuleTypeChange}
                    options={this.state.moduleTypeOptions}
                  />
                </div>
                <div className="select-multi-option">
                  <label>Select file type</label>
                  <Select
                    name="select-file-type"
                    placeholder="File Type"
                    value={this.state.selectedFileType}
                    onChange={this.handleFileTypeChange}
                    options={this.state.fileTypeOptions}
                  />
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer className="hunter-modal-footer">
              <Button
                variant="primary"
                className="btn-md"
                onClick = {() => {
                  this.handleScriptFileOpen(this.state.selectedFileType)
                }}
              >
                Open
              </Button>
            </Modal.Footer>
          </Modal>
          <Modal show={this.state.isShowConfigOpenModal} className="hunter-modal" onHide={this.processConfigModalClose}>
            <Modal.Header closeButton>
              <Modal.Title>Open Script File</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="hunter-select-module-area">
                <div className="select-multi-option">
                  <label>Select Config File</label>
                  <Select
                    className="hunter-module-type-select"
                    name="select-config-file"
                    placeholder="Config File"
                    value={this.state.selectedConfigFile}
                    onChange={this.handleConfigFileChange}
                    options={this.state.configFileOptions}
                  />
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer className="hunter-modal-footer">
              <Button
                variant="primary"
                className="btn-md"
                onClick = {() => {
                  this.handleConfigFileOpen()
                }}
              >
                Open
              </Button>
            </Modal.Footer>
          </Modal>
          <Modal show={this.state.isShowBotConfigOpenModal} className="hunter-modal" onHide={this.botConfigModalClose}>
            <Modal.Header closeButton>
              <Modal.Title>Open Bot Config File</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="hunter-select-module-area">
                <div className="select-multi-option">
                  <label>Select Bot Config File</label>
                  <Select
                    className="hunter-module-type-select"
                    name="select-config-file"
                    placeholder="Config File"
                    value={this.state.selectedBotConfigFile}
                    onChange={this.handleBotConfigFileChange}
                    options={this.state.botConfigFileOptions}
                  />
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer className="hunter-modal-footer">
              <Button
                variant="primary"
                className="btn-md"
                onClick = {() => {
                  this.handleBotConfigFileOpen()
                }}
              >
                Open
              </Button>
            </Modal.Footer>
          </Modal>
          <Modal show={this.state.isShowSaveModal} className="hunter-modal" onHide={this.SaveScriptModalClose}>
            <Modal.Header closeButton>
              <Modal.Title>Save Script File</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="hunter-form-group">
                <input
                  type="text"
                  className="form-control hunter-form-control"
                  placeholder="script file name"
                  value={
                    this.state.filename
                  }
                  onChange={(e) => { this.handleScriptFileNameChange(e)}}
                />
              </div>
            </Modal.Body>
            <Modal.Footer className="hunter-modal-footer">
              <Button variant="primary" onClick={this.handleScriptFileSave} className="btn-md">
                Save
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      </React.Fragment>
    );
  }
}