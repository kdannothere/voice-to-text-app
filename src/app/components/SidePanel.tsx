import Image from "next/image";
import { useState } from "react";
import { Record } from "../utils/Record";

export default function SidePanel({ records }: { records: Record[] }) {
  const [show, setShow] = useState(false);
  let key = 1;
  return (
    <>
      {show ? (
        <div className='side-panel w-80 absolute left-5 top-5 border-4 p-4 pb-8 border-dashed rounded-md bg-slate-100'>
          <Image
            onClick={() => setShow(!show)}
            className='cursor-pointer'
            src={"/side-panel.png"}
            alt={"Side panel"}
            width={24}
            height={24}
          ></Image>
          <h3 className='font-bold text-lg my-4'>History</h3>
          {records.length ? (
            <ul>
              {records.slice(0, 10).map((record) => (
                <li
                  className='text-nowrap overflow-hidden text-ellipsis'
                  key={key++}
                >{`${key}. ${record.title}`}</li>
              ))}
            </ul>
          ) : (
            <p>There are no records yet.</p>
          )}
        </div>
      ) : (
        <div className='side-panel absolute left-10 top-10'>
          <Image
            onClick={() => setShow(!show)}
            className='cursor-pointer'
            src={"/side-panel.png"}
            alt={"Side panel"}
            width={24}
            height={24}
          ></Image>
        </div>
      )}
    </>
  );
}
