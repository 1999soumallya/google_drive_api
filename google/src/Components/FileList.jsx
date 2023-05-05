import React, { useCallback, useEffect, useState } from 'react'
import { Alert, Button, Card, Col, Container, Row, Spinner } from 'react-bootstrap'
import { deleteMyDriveFile, downloadMyDriveFile, getMyDriveFileList } from '../Functions/GetDriveDetails'
import { toast } from 'react-toastify'
import { Link } from "react-router-dom"

export default function FileList() {

    const [FolderArray, setFolderArray] = useState([])
    const [FileArray, setFileArray] = useState([])
    const [Loading, setLoading] = useState(false)

    const GetDriveFiles = useCallback(() => {
        setLoading(true)
        getMyDriveFileList().then((data) => {
            if (data.folder.items.length > 0) {
                setFolderArray(data.folder.items)
            } else {
                setFolderArray([])
            }

            if (data.files.items.length > 0) {
                setFileArray(data.files.items)
            } else {
                setFileArray([])
            }

            setLoading(false)
        }).catch((error) => {
            setLoading(false)
            toast.error(error, { position: "top-right", autoClose: 5000, hideProgressBar: false, closeOnClick: true, pauseOnHover: true, draggable: true, progress: undefined, theme: "colored", });
        })
    }, [])

    const DeleteFiles = (id) => {
        if (window.confirm("Are you seoure to delete this file")) {
            deleteMyDriveFile(id).then((data) => {
                GetDriveFiles()
            }).catch((error) => {
                toast.error(error, { position: "top-right", autoClose: 5000, hideProgressBar: false, closeOnClick: true, pauseOnHover: true, draggable: true, progress: undefined, theme: "colored", });
            })
        } else {
            return
        }
    }

    const DownloadFiles = (id, originalFilename) => {
        downloadMyDriveFile(id).then((data) => {
            const url = window.URL.createObjectURL(data)
            const element = document.createElement("a")
            element.href = url
            element.download = originalFilename
            element.click()
            element.remove()
            toast.success(data.message, { position: "top-right", autoClose: 5000, hideProgressBar: false, closeOnClick: true, pauseOnHover: true, draggable: true, progress: undefined, theme: "colored", });
        }).catch((error) => {
            toast.error(error, { position: "top-right", autoClose: 5000, hideProgressBar: false, closeOnClick: true, pauseOnHover: true, draggable: true, progress: undefined, theme: "colored", });
        })
    }

    useEffect(() => {
        GetDriveFiles()
    }, [GetDriveFiles])

    return (
        <>
            <Container className="pt-4">
                <Row>
                    {
                        Loading ? (<Spinner animation="grow" variant="success" />) : (FolderArray.length === 0 && FileArray.length === 0) && (
                            <Col md={12}>
                                <Alert key={"info"} variant={"info"}>
                                    No deta Found
                                </Alert>
                            </Col>
                        )
                    }
                    <Col md={12}>
                        <Row>
                            {
                                !Loading && (FolderArray.length > 0) && FolderArray.map((items) => (
                                    <Col md={2} className="mb-2" key={items.id}>
                                        <Link style={{ "textDecoration": "none" }} to={`/${items.id}`}>
                                            <Button variant="secondary" className="d-flex justify-content-left align-items-center" style={{ "minWidth": "100%", "gap": "10px", "maxWidth": "100%", "overflow": "hidden" }}>
                                                <i className="fa-solid fa-folder"></i>
                                                <p className="p-0 m-0" style={{ "whiteSpace": "nowrap" }}>{items.title}</p>
                                            </Button>
                                        </Link>
                                    </Col>
                                ))
                            }
                        </Row>
                    </Col>
                    <Col md={12}>
                        <Row>
                            {
                                !Loading && (FileArray.length > 0) && FileArray.map((item) => (
                                    <Col md={3} className="mb-2" key={item.id}>
                                        <Card style={{ width: '18rem' }}>
                                            <Card.Img variant="top" src={item.thumbnailLink} height={150} style={{ objectFit: "contain" }} />
                                            <Card.Body>
                                                <Card.Title>{item.originalFilename}</Card.Title>
                                                <div className="d-flex justify-content-between">
                                                    <Button variant="primary" onClick={() => DownloadFiles(item.id, item.originalFilename)}><i className="fa-solid fa-download"></i></Button>
                                                    <Button variant="danger" onClick={() => DeleteFiles(item.id)}><i className="fa-regular fa-trash-can"></i></Button>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                ))
                            }
                        </Row>
                    </Col>
                </Row>
            </Container>
        </>
    )
}