"use client";

import { Form, Input, Button, message } from "antd";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/features/auth/slices/authCredentialSlice";
import { LoginFormValues } from "@/types/auth";
import { useLoginMutation } from "@/features/auth/slices/authApiSlice";

interface LoginFormProps {
  onSubmit: ReturnType<typeof useLoginMutation>[0];
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  const handleSubmit = async (values: LoginFormValues) => {
    try {
      const response = await onSubmit(values).unwrap();
      dispatch(setCredentials({ token: response.token, user: response.user }));
      message.success("Login successful");
      router.push("/");
    } catch (error) {
      const errorMessage =
        (error as { data?: { message: string } }).data?.message ||
        "An error occurred";
      message.error(errorMessage);
    }
  };

  return (
    <Form
      form={form}
      onFinish={handleSubmit}
      className="w-full max-w-md p-8 bg-white rounded shadow-md"
      layout="vertical"
    >
      <Form.Item
        name="email"
        rules={[
          {
            required: true,
            type: "email",
            message: "Please enter a valid email",
          },
        ]}
      >
        <Input placeholder="Email" size="large" />
      </Form.Item>
      <Form.Item
        name="password"
        rules={[
          {
            required: true,
            min: 8,
            message: "Password must be at least 8 characters",
          },
        ]}
      >
        <Input.Password placeholder="Password" size="large" />
      </Form.Item>
      <Button type="primary" htmlType="submit" size="large" className="w-full">
        Login
      </Button>
    </Form>
  );
};

export default LoginForm;
