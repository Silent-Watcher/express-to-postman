// Minimal subset of Postman Collection v2.1 types

export interface Collection {
	info: {
		name: string;
		schema: string;
	};
	item: ItemGroup[];
}

export interface ItemGroup {
	name: string;
	item: Item[];
}

export interface Item {
	name: string;
	request: Request;
}

export interface Request {
	method: string;
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	header: any[]; // you can refine later
	url: {
		raw: string;
		host: string[];
		path: string[];
		query?: { key: string; value: string }[];
	};
}
