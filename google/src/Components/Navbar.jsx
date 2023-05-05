import React from 'react'
import axios from 'axios';
import { Container, Nav, Navbar, NavbarBrand } from 'react-bootstrap';

export default function DefaultNavbar({ isLoggedIn, signOut }) {
    const CreateGoogleAuthLink = async () => {
        try {
            await axios.get("http://localhost:3001/createauthlink").then((response) => {
                if (response) {
                    window.location.href = response.data
                }
            }).catch((error) => {
                console.log(error)
            })
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <>
            <Navbar bg="dark" expand="lg" variant="dark">
                <Container fluid>
                    <NavbarBrand>Navbar</NavbarBrand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="navbarSupportedContent">
                        <Nav className="me-auto">
                            {
                                isLoggedIn ? (
                                    <>
                                        <Nav.Item>
                                            <Nav.Link active aria-current="page" href="#">Get about my drive</Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item>
                                            <Nav.Link href="#">Get about Files</Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item>
                                            <Nav.Link href="#" onClick={signOut}>Sign Out</Nav.Link>
                                        </Nav.Item>
                                    </>
                                ) : (
                                    <Nav.Item>
                                        <Nav.Link href="#" onClick={CreateGoogleAuthLink}>Open Picker</Nav.Link>
                                    </Nav.Item>
                                )
                            }
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </>
    )
}
