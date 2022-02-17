export interface PaginateResponse {
  statusCode: 'success' | 'error',
  count: number,
  currentPage: number,
  nextPage: number,
  prevPage: number,
  lastPage: number,
}

export interface PaginateProps<Type> {
    data:{ 
        result: Type,
        total: number
    },
    page: number,
    limit:number
}
export function handlePaginateResponse<Type>({data, page, limit} :PaginateProps<Type>):PaginateResponse {
    const {result, total} = data;
    const lastPage=Math.ceil(total/limit);
    const nextPage=page+1 >lastPage ? null :page+1;
    const prevPage=page-1 < 1 ? null :page-1;
    return {
      statusCode: 'success',
      count: total,
      currentPage: page,
      nextPage: nextPage,
      prevPage: prevPage,
      lastPage: lastPage,
    }
  }