import { RestObject } from '../sObject';
import { Rest } from '../rest';
import { AxiosResponse } from 'axios';
import { BatchRequest } from 'src/main/lib/composite/batch';

export interface CompositeRequest extends BatchRequest {
    referenceId: string;
    body?: any;
}

export interface CompositePayload {
    compositeRequest: CompositeRequest[];
}

export interface CompositeResponse {
    body: any;
    httpStatusCode: number;
    referenceId: string;
}

export interface CompositeResult {
    compositeResponse: CompositeResponse[];
}

export class Composite {
    public compositeRequest: CompositeRequest[];
    public callbacks: Array<(n: CompositeResponse) => void>;
    private client: Rest;
    constructor () {
        this.compositeRequest = [];
        this.callbacks = [];
        this.client = Rest.Instance;
    }

    public addRequest (request: CompositeRequest, callback?: (n: CompositeResponse) => void): Composite {
        this.compositeRequest.push(request);
        this.callbacks.push(callback);
        return this;
    }

    public async send (): Promise<CompositeResult> {
        console.log(this.compositeRequest);
        let payload: CompositePayload = {
            compositeRequest: this.compositeRequest
        };
        let resp = await this.client.request.post(`/services/data/${Rest.Instance.version}/composite`, payload);

        let result: CompositeResult = resp.data;
        for (let i = 0; i < this.callbacks.length; i++) {

            let callback = this.callbacks[i];
            if (callback !== undefined) {
                callback(result.compositeResponse[i]);
            }
        }

        return result;
    }
}
