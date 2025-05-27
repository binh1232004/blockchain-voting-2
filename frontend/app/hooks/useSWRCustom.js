'use client'
import useSWR from "swr"
export default function useSWRCustom(){
    const fetcher = (url) => fetch(url).then((res) => res.json());
    const { data: oer, error, isLoading } = useSWR(
        '/api/oer/openTextBook',
        fetcher
    );
    return{ 
        oer,
        error,
        isLoading
    }    
}