
import React, { Component } from "react";
import Switch from "react-switch";
import Select from 'react-select'
import { Editor } from "react-draft-wysiwyg";
import { EditorState, convertToRaw ,convertFromHTML,ContentState} from "draft-js";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import draftToHtml from "draftjs-to-html";
import { getConfigFileDetail, getScriptFile, getModuleTypeNames, getFileTypeNames, createScriptFile, saveConfigFile, saveScriptFile, getConfigFileList } from "api/Api";
import {
  Button
} from "reactstrap";
import { MDBBtn, MDBIcon } from "mdbreact";

import Modal from 'react-bootstrap/Modal'

export default class TextEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
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
        timeframe: [
          {
            value: '2m',
            label: '2m'
          },
          {
            value: '4m',
            label: '4m'
          },
          {
            value: '12m',
            label: '12m'
          }
        ],
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
        hours: {value: 'emkt', label: 'emkt'},
        name: '',
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
        hours: null,
        name: '',
        macro_strategy: null,
        indicator_signalling: null,
      },
      selectedConfigFile: null,
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
      strategyIndicators: [],
    };
  }

  openAddIndicatorModal = () => {
    this.setState({ isShowAddIndicatorModal: true });
  }

  handleChange = (checked) => {
    this.setState({ isCheckedStrategy: checked });
  }

  componentDidMount () {
    this.loadModuleTypes()  
    this.loadConfigFiles()
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

    if (!this.state.content.length) {
      alert("File content is empty!")
      return;
    }

    if (this.state.isSelectedStrategyFile) {
      if (!this.state.strategyIndicators.length) {
        console.log("content is empty!")
        return;
      }
    } else {
      if (this.state.isCheckedStrategy) {
        console.log("content is empty!")
        return;
      }
    }

    let res;
    if (this.state.isSelectedStrategyFile) {
      res = await saveScriptFile(
        this.state.isUpdate ? this.state.selectedFileType.value : this.state.filename,
        this.state.content,
        this.state.isUpdate,
        this.state.isCheckedStrategy
      )
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
  
  ProcessConfigModalClose = () => {
    this.setState({isShowConfigOpenModal: false})
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
    console.log("res", res)
    this.ProcessConfigModalClose()
  }

  handleSave = (content) => {
    this.setState({
      content,
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
    console.log("indicator", indicators)
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
        }
      }
    )
  }

  render() {
    const { editorState } = this.state;
    return (
      <React.Fragment>
        <div className="hunter-textedit-container" > 
          <div className="hunter-data-table-title">
            Strategy File Editor
          </div>
          <Editor
            editorState={editorState}
            toolbarClassName="toolbarClassName"
            wrapperClassName="wrapperClassName"
            editorClassName="editorClassName"
            editorStyle={{backgroundColor:"whitesmoke"}}
            onEditorStateChange={this.onEditorStateChange}
          />
          <div className="hunter-editor-button-area">
            <div className="display-flex-right">
              <span className="mr-10">Strategy</span>
                <Switch onChange={this.handleChange} checked={this.state.isCheckedStrategy} />
              <span className="ml-10">Config</span>
            </div>
            <div className="display-flex-left">
              <button className="btn btn-md btn-secondary" onClick={()=>this.handleScriptFileCreate()}>New</button>
              <button className="btn btn-md btn-secondary" onClick={()=>this.handleOpenScriptFile()}>Open</button>
              <button className="btn btn-md btn-secondary" onClick={()=>this.handleSave(draftToHtml(convertToRaw(editorState.getCurrentContent())))}>Save</button>
            </div>
          </div>
          {this.state.isCheckedStrategy && (
          <div className="hunter-data-table-title mt-20">
            Strategy Indicator Editor
          </div>)}
          {this.state.isCheckedStrategy && (
          <div className={"strategy-indicator-edit-area"}>
            <ul className="list-group">
              {this.displayProcessEditor()}
            </ul>
            <div className="strategy-edit-icon-area">
              <button className="btn btn-md btn-secondary" onClick={()=>this.handleIndicatorReset()}>Reset</button>
              <button className="btn btn-md btn-secondary" onClick={()=>this.handleOpenProcessConfigModal()}>Open</button>
              <button className="btn btn-md btn-secondary" onClick={()=>this.handleProcessConfigSettingSave()}>Save</button>
            </div>
          </div>
          )}
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
          <Modal show={this.state.isShowConfigOpenModal} className="hunter-modal" onHide={this.ProcessConfigModalClose}>
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