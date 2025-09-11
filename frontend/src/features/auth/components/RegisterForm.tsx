"use client";

import { Form, Input, Button, Select, message } from "antd";
import { useRouter } from "next/navigation";
import { RegisterFormValues } from "@/types/auth";
import { useRegisterMutation } from "@/features/auth/slices/authApiSlice";

interface RegisterFormProps {
  onSubmit: ReturnType<typeof useRegisterMutation>[0];
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSubmit }) => {
  const router = useRouter();
  const [form] = Form.useForm();

  const handleSubmit = async (values: RegisterFormValues) => {
    try {
      const response = await onSubmit(values).unwrap();
      message.success(response.message);
      router.push("/login");
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
        name="username"
        rules={[{ required: true, message: "Please enter a username" }]}
      >
        <Input placeholder="Username" size="large" />
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
      <Form.Item
        name="role"
        rules={[{ required: true, message: "Please select a role" }]}
      >
        <Select placeholder="Role" size="large">
          <Select.Option value="admin">Admin</Select.Option>
          <Select.Option value="editor">Editor</Select.Option>
        </Select>
      </Form.Item>
      <Button type="primary" htmlType="submit" size="large" className="w-full">
        Register
      </Button>
    </Form>
  );
};

export default RegisterForm;
