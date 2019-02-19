
import {
	setChainProps,
} from './utils.js'

import {
	UnauthorizedPropChangeError
} from './utils_DEPRECATED.js'

import './async.js'
import './sync.js'

import { createTestChain } from './async_DEPRECATED.js'
import { createTestChain as createTestChainSync } from './sync_DEPRECATED.js'

export {
	setChainProps,
	UnauthorizedPropChangeError,

	createTestChain,
	createTestChainSync
}
