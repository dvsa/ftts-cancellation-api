import { extractMessage } from '../../../src/error/errorUtils';

describe('errorUtils', () => {
  const errorMessage = 'failed';

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('extractMessage', () => {
    const error = {
      message: errorMessage,
    };
    const nestedError = {
      error,
    };

    test.each([
      [error],
      [nestedError],
      [[error]],
      [[nestedError]],
    ])(
      'GIVEN an error WHEN called THEN returns proper error message',
      (givenError: any) => {
        const actualErrorMessage = extractMessage(givenError);

        expect(actualErrorMessage).toEqual(errorMessage);
      },
    );
  });
});
