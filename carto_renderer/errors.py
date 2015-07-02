"""
Error classes for this service.
"""


class ServiceError(Exception):
    """
    Base class for errors in this service.
    """
    def __init__(self, message, status_code):
        Exception.__init__(self)
        self.message = message + '\n'
        self.status_code = status_code


class BadRequest(ServiceError):
    """
    Base class for 400 errors.
    """
    def __init__(self, message):
        super(self.__class__, self).__init__(message, 400)


class JsonKeyError(BadRequest):
    """
    Error to throw when keys are missing.
    """
    singular = 'Request JSON must contain the key "{}".'
    plural = 'Request JSON must contain the keys "{}" and "{}".'

    def __init__(self, keys):
        message = ""
        if str(keys) == keys:
            keys = [keys]

        if len(keys) == 1:
            message = JsonKeyError.singular.format(keys[0])
        else:
            beg = keys[:-1]
            message = JsonKeyError.plural.format('", "'.join(beg),
                                                   keys[-1])

        super(self.__class__, self).__init__(message)
