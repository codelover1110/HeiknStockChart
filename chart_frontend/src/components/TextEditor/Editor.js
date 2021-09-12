
import React, { Component } from "react";
import Select from 'react-select'
import { Editor } from "react-draft-wysiwyg";
import { EditorState, convertToRaw ,convertFromHTML,ContentState} from "draft-js";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import draftToHtml from "draftjs-to-html";
import { getScriptFile, getModuleTypeNames, getFileTypeNames, createScriptFile } from "api/Api";
import {
  Button
} from "reactstrap";

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
      selectedModuleContents: [],
      filename: '',
      file:[],
      content: null,
      isUpdate: false,
      isShowOpenModal: false,
      isShowSaveModal: false,
    };
  }

  componentDidMount () {
    this.loadModuleTypes()  
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

    const res = await createScriptFile(
      this.state.isUpdate ? this.state.selectedFileType.value : this.state.filename,
      this.state.content,
      this.state.isUpdate
    )
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
  
  handleFileTypeChange = async (e) => {
    this.setState({
      selectedFileType: e,
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

  handleSaveModalShow = async () => {
    this.setState({isShowSaveModal: true})
  }
  
  OpenScriptModalClose = () => {
    this.setState({isShowOpenModal: false})
  }
  
  SaveScriptModalClose = () => {
    this.setState({isShowSaveModal: false})
  }

  handleScriptFileOpen = async (selectedFileType) => {
    const selectedFile = this.state.selectedModuleContents.filter((file) => file.name === this.state.selectedFileType.value)
    const blocksFromHTML = convertFromHTML(selectedFile[0] ? selectedFile[0].contents : '');
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

  handleSave = (content) => {
    this.setState({
      content,
    })
    this.handleSaveModalShow()
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
          <div className="display-flex-left">
            <button className="btn btn-md btn-secondary" onClick={()=>this.handleScriptFileCreate()}>New</button>
            <button className="btn btn-md btn-secondary" onClick={()=>this.handleOpenScriptFile()}>Open</button>
            <button className="btn btn-md btn-secondary" onClick={()=>this.handleSave(draftToHtml(convertToRaw(editorState.getCurrentContent())))}>Save</button>
          </div>
          {/* {this.state.textdata.map((item, index) => <div className="container bg-dark mt-2 p-2 rounded text-light" key={index}>{ item }</div>)} */}
          <Modal show={this.state.isShowOpenModal} className="hunter-modal" onHide={this.OpenScriptModalClose}>
            <Modal.Header closeButton>
              <Modal.Title>Open Script File</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="hunter-select-module-area">
                <div className="select-multi-option">
                  <label>select module type</label>
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
                  <label>select file type</label>
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