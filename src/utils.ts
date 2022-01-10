import { Either } from "fp-ts/Either";
import * as E from "fp-ts/Either";

/**
 * fp-ts helper functions
 */
export function tap<E,A>( fn: (a: A) => void ): (ea: Either<E,A>) => Either<E,A> {
    return ea => {
        if( !E.isLeft(ea) )
            fn(ea.right);
        return ea;
    }
}

export function tapL<E,A>( fn: (e: E) => void ): (ea: Either<E,A>) => Either<E,A> {
    return ea => {
        if( E.isLeft(ea) )
            fn(ea.left);
        return ea;
    }
}


