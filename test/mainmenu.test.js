import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import App from "../app";

// Mock the axios library for testing purposes
jest.mock("axios");

describe("App", () => {
  // Unit test for a utility function
  describe("isValidEmail", () => {
    it("should return true for a valid email", () => {
      const isValidEmail = jest.requireActual("./utils").isValidEmail;
      expect(isValidEmail("john@example.com")).toBe(true);
    });

    it("should return false for an invalid email", () => {
      const isValidEmail = jest.requireActual("./utils").isValidEmail;
      expect(isValidEmail("invalidemail")).toBe(false);
    });
  });

  // Integration test for a component
  describe("Registration Form", () => {
    it("should display an error message for missing fields", async () => {
      render(<App />);

      // Simulate form submission with missing fields
      fireEvent.submit(screen.getByRole("form"));

      // Assert that the error message is displayed
      expect(
        await screen.findByText(/Please fill in all fields/i)
      ).toBeInTheDocument();
    });

    it("should register a user with valid data", async () => {
      // Mock the registration API call
      axios.post.mockResolvedValueOnce({ data: { success: true } });

      render(<App />);

      // Fill out the registration form
      userEvent.type(screen.getByLabelText(/name/i), "John Doe");
      userEvent.type(screen.getByLabelText(/email/i), "john@example.com");
      userEvent.type(screen.getByLabelText(/password/i), "password123");

      // Submit the form
      fireEvent.submit(screen.getByRole("form"));

      // Assert that the success message is displayed
      expect(
        await screen.findByText(/Registration successful/i)
      ).toBeInTheDocument();
    });
  });

  // Snapshot test for a component
  describe("Header", () => {
    it("should render correctly", () => {
      const { asFragment } = render(<App />);
      expect(asFragment()).toMatchSnapshot();
    });
  });

  // End-to-End (E2E) test using React Testing Library
  describe("User Flow", () => {
    it("should allow a user to register and log in", async () => {
      // Mock the registration and login API calls
      axios.post.mockResolvedValueOnce({ data: { success: true } });
      axios.post.mockResolvedValueOnce({ data: { token: "mock_token" } });

      render(<App />);

      // Register a new user
      userEvent.type(screen.getByLabelText(/name/i), "John Doe");
      userEvent.type(screen.getByLabelText(/email/i), "john@example.com");
      userEvent.type(screen.getByLabelText(/password/i), "password123");
      fireEvent.submit(screen.getByRole("form"));

      // Assert that the success message is displayed
      expect(
        await screen.findByText(/Registration successful/i)
      ).toBeInTheDocument();

      // Navigate to the login page
      userEvent.click(screen.getByText(/log in/i));

      // Fill out the login form
      userEvent.type(screen.getByLabelText(/email/i), "john@example.com");
      userEvent.type(screen.getByLabelText(/password/i), "password123");
      fireEvent.submit(screen.getByRole("form"));

      // Assert that the user is logged in and redirected to the dashboard
      expect(
        await screen.findByText(/welcome to the dashboard/i)
      ).toBeInTheDocument();
    });
  });
});
