import React, { useEffect, useState } from 'react'
import { Alert, Button, Card, Col, Container, Row, Spinner } from 'react-bootstrap'
import { deleteMyDriveFile, downloadMyDriveFile, getMyDriveFileList } from '../Functions/GetDriveDetails'
import { toast } from 'react-toastify'

export default function FileList() {

    const [DetaArray, setDetaArray] = useState([])
    const [Loading, setLoading] = useState(false)

    const GetDriveFiles = () => {
        setLoading(true)
        getMyDriveFileList().then((data) => {
            if (data.length > 0) {
                setLoading(false)
                setDetaArray(data)
            } else {
                setDetaArray([])
            }
        }).catch((error) => {
            setLoading(false)
            toast.error(error, { position: "top-right", autoClose: 5000, hideProgressBar: false, closeOnClick: true, pauseOnHover: true, draggable: true, progress: undefined, theme: "colored", });
        })
    }

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
    }, [])

    return (
        <>
            <Container className="pt-4">
                <Row>
                    {
                        Loading ?
                            (<Spinner animation="grow" variant="success" />)
                            : (DetaArray.length > 0) ? DetaArray.map((items) => (
                                <Col md={3} className="mb-2" key={items.id}>
                                    <Card style={{ width: '18rem' }}>
                                        <Card.Img variant="top" src={items.thumbnailLink} height={150} style={{ objectFit: "contain" }} />
                                        <Card.Body>
                                            <Card.Title>{items.originalFilename}</Card.Title>
                                            {/* id selfLink */}
                                            <div className="d-flex justify-content-between">
                                                <Button variant="primary" onClick={() => DownloadFiles(items.id, items.originalFilename)}><i className="fa-solid fa-download"></i></Button>
                                                <Button variant="danger" onClick={() => DeleteFiles(items.id)}><i className="fa-regular fa-trash-can"></i></Button>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            )) : (
                                <Col md={12}>
                                    <Alert key={"info"} variant={"info"}>
                                        No deta Found
                                    </Alert>
                                </Col>
                            )
                    }
                </Row>
            </Container>
        </>
    )
}
