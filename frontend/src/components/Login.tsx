import React, { useState } from 'react';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { Button, Checkbox, Form, Input, message } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import LogoImage from './assets/Frame.svg';
import GoogleIcon from './assets/GoogleIcon.svg'; // Google icon SVG (unused right now)

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState('');
  const [rememberMe] = useState(false);

  const onFinish = async (values: { email: string; password: string }) => {
    try {
      const response = await axios.post('http://127.0.0.1:5000/auth/login', values, {
        withCredentials: true,
      });

      if (rememberMe) {
        document.cookie = `session_id=${response.data.access_token}; path=/; max-age=${30 * 24 * 60 * 60
          }`;
      }

      localStorage.setItem('token', response.data.access_token);
      message.success('Login successful!');
      navigate('/Dashboard');
    } catch (error) {
      console.error('Login Failed:', error);
      setLoginError('Invalid credentials. Please try again.');
      message.error('Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="login-container">
      <div className="logo-wrapper">
        <img src={LogoImage} alt="Logo" className="login-logo" />
        <div className="note-genius-text">Note Genius</div>
      </div>

      <div className="login-headings">
        <h1 className="main-heading">Log in to your account</h1>
        <p className="sub-heading">Enter your login information</p>
      </div>

      <Form
        name="login"
        initialValues={{ remember: true }}
        className="login-form"
        onFinish={onFinish}
        validateTrigger="onSubmit"
      >
        {/* E-mail field */}
        <Form.Item
          name="email"
          rules={[
            { required: true, message: 'Please input your Email!' },
            { type: 'email', message: 'Invalid email format!' },
          ]}
          style={{ marginBottom: 34 }}
        >
          <Input
            prefix={<MailOutlined />}
            placeholder="email@domain.com"
            className="custom-input"
          />
        </Form.Item>

        {/* Password field */}
        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Please input your Password!' }]}
          style={{ marginBottom: 34 }}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="password"
            className="custom-input"
          />
        </Form.Item>

        <div className="remember-me">
          <Checkbox />
          <span>Remember me</span>
        </div>

        {loginError && (
          <div
            className="error-message"
            style={{ color: 'red', textAlign: 'center', marginBottom: 16 }}
          >
            {loginError}
          </div>
        )}

        <Button block type="primary" htmlType="submit" className="login-btn">
          Log in
        </Button>

        <div className="divider-with-text">
          <div className="divider" />
          <span className="divider-text">New to Note Genius?</span>
          <div className="divider" />
        </div>

        <Button block className="create-account-btn" onClick={() => navigate('/signup')}>
          Create an Account
        </Button>

        {/* Optional: social login (currently disabled) */}
        {false && (
          <>
            <div className="divider-with-text">
              <div className="divider" />
              <span className="divider-text">or continue with</span>
              <div className="divider" />
            </div>
            <Button className="google-btn">
              <img src={GoogleIcon} alt="Google icon" className="google-icon" />
              <span>Google</span>
            </Button>
          </>
        )}
      </Form>

      <div className="footer-text">
        By clicking continue, you agree to our Terms of Service and Privacy Policy
      </div>
    </div>
  );
};

export default Login;
