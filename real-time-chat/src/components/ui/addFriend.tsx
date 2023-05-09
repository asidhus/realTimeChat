// The below import defines which components come from formik
// import { Field, Form, Formik } from 'formik';

import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  Button,
  Input,
  Heading,
} from '@chakra-ui/react';

import { toast } from 'react-hot-toast';
import axios, { AxiosError } from 'axios';

import {
  Formik, Form, Field, FieldInputProps, FormikValues, FormikHelpers as FormikActions,
} from 'formik';

interface MyFormValues {
  Email: string;
}

async function addFriendDB(values: FormikValues, actions: FormikActions<MyFormValues>) {
  try {
    await axios.post('/api/friends/add', values);
    toast.success('Friend Added');
    actions.resetForm({
      values: {
        Email: '',
      },
    });
  } catch (err) {
    if (err instanceof AxiosError) {
      actions.setErrors({ Email: err.response?.data || err.message });
    } else {
      actions.setErrors({ Email: 'Something went wrong' });
    }
  } finally {
    actions.setSubmitting(false);
  }
}

function addFriend() {
  const initialValues = { Email: '' };
  function validateEmail(value: string | undefined) {
    let error;
    if (!value) {
      error = 'Email is Required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)) {
      error = 'Invalid email address';
    }
    return error;
  }

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={async (values: FormikValues, actions: FormikActions<MyFormValues>) => {
        await addFriendDB(values, actions);
      }}
    >
      {(props) => (
        <Form>
          <Field name="Email" validate={(value: string) => validateEmail(value)}>
            {({ field, form }:{ field: FieldInputProps<string>, form: any }) => (
              <FormControl isInvalid={form.errors.Email && form.touched.Email}>
                <FormLabel>
                  <Heading size="lg" fontWeight="bold">
                    Add Friend
                  </Heading>
                </FormLabel>
                <Input
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  value={field.value}
                  id="Email"
                  placeholder="Email"
                />
                <FormErrorMessage>{form.errors.Email}</FormErrorMessage>
              </FormControl>
            )}
          </Field>
          <Button
            mt={4}
            colorScheme="teal"
            isLoading={props.isSubmitting}
            type="submit"
          >
            Submit
          </Button>
        </Form>
      )}
    </Formik>
  );
}

export default addFriend;
