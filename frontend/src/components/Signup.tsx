import React from 'react';
import { Button, Form, Input } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import LogoImage from "./assets/Frame.svg";

const SignupForm: React.FC = () => {
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    try {
      // const response = await axios.post('http://127.0.0.1:5000/auth/signup', values);
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/signup`, values);
      console.log('Signup success:', response.data);
      alert('Signup successful! Please login.');
      navigate("/Dashboard");
    } catch (error) {
      console.error('Signup failed:', error);
      alert('Signup failed. Please try again.');
    }
  };

  return (
    <div className="signup-container">
      <div className="logo-wrapper">
        <img src={LogoImage} alt="Logo" className="login-logo" />
        <div className="note-genius-text">Note Genius</div>
      </div>

      <div className="signup-headings">
        <h1 className="main-heading">Create an account</h1>
        <p className="sub-heading">Enter your email to sign up for this app</p>
      </div>

      <Form
        name="signup"
        onFinish={onFinish}
        className="signup-form"
        validateTrigger="onSubmit"
      >
        <Form.Item
          name="name"
          rules={[{ required: true, message: 'Please input your name!' }]}
          style={{ marginBottom: 34 }}
          
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="name"
            className="custom-input"
          />
        </Form.Item>

        <Form.Item
          name="username"
          rules={[{ required: true, message: 'Please input your username!' }]}
          style={{ marginBottom: 34 }}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="username"
            className="custom-input"
          />
        </Form.Item>

        <Form.Item
          name="email"
          rules={[
            { required: true, message: 'Please input your email!' },
            { type: 'email', message: 'Invalid email format' }
          ]}
          style={{ marginBottom: 34 }}
        >
          <Input
            prefix={<MailOutlined />}
            placeholder="email@domain.com"
            className="custom-input"
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[
            { required: true, message: 'Please input your password!' },
            { min: 6, message: 'Password must be at least 6 characters!' }
          ]}
          hasFeedback
          style={{ marginBottom: 34 }}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="password"
            className="custom-input"
          />
        </Form.Item>

        <Form.Item
          name="confirm"
          dependencies={['password']}
          hasFeedback
          rules={[
            { required: true, message: 'Please confirm your password!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject('Passwords do not match!');
              },
            }),
          ]}
          style={{ marginBottom: 34 }}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="confirm password"
            className="custom-input"
          />
        </Form.Item>

        <Button
          block
          type="primary"
          htmlType="submit"
          className="signup-btn"
        >
          Sign Up
        </Button>

        <div className="divider-with-text">
          <div className="divider" />
          <span className="divider-text">Already have an account?</span>
          <div className="divider" />
        </div>

        <Button
          block
          className="login-now-btn"
          onClick={() => navigate("/Dashboard")}
        >
          Login
        </Button>

        {/* <div className="divider-with-text">
          <div className="divider" />
          <span className="divider-text">or continue with</span>
          <div className="divider" />
        </div>

        <Button className="google-btn">
          <img src={GoogleIcon} alt="Google icon" className="google-icon" />
          <span>Google</span>
        </Button> */}
      </Form>

      <div className="footer-text">
        By clicking continue, you agree to our Terms of Service and Privacy Policy
      </div>
    </div>
  );
};

export default SignupForm;