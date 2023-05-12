import { Options } from '../../models/base-options.model';
import { BaseEntityFindArgs } from '../models/base-args.model';

type RestArgs = Omit<BaseEntityFindArgs, '_skip' | '_sort' | '_limit'>;

export const getSearchParams = <T extends BaseEntityFindArgs>(params: T) => {
  const { _skip, _sort, _limit, ...restParams } = params;
  const options: Options = {};

  if (_skip) {
    options.skip = _skip;
  }

  if (_sort) {
    options.sort = _sort;
  }

  if (_limit) {
    options.limit = _limit;
  }

  return {
    args: getArgs(restParams),
    options,
  };
};

const getFieldName = (fieldName: string) =>
  fieldName === 'id' ? '_id' : fieldName;

const getArgs = <T extends RestArgs>(args: T) => {
  const { _in, _nin, _like, ...restArgs } = args;

  if (_in) {
    const { fieldName, values } = _in;
    restArgs[getFieldName(fieldName)] = { $in: values };
  }

  if (_nin) {
    const { fieldName, values } = _nin;
    restArgs[getFieldName(fieldName)] = { $nin: values };
  }

  if (_like) {
    const { fieldName, regExpStr } = _like;
    restArgs[getFieldName(fieldName)] = { $regex: new RegExp(regExpStr) };
  }

  return restArgs;
};
