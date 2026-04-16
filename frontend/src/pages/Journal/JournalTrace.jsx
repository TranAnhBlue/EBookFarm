import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, Steps, Typography, Descriptions, Spin, Tag } from 'antd';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const { Title } = Typography;

const JournalTrace = () => {
  const { qrCode } = useParams();

  const { data: journal, isLoading, isError } = useQuery({
      queryKey: ['trace', qrCode],
      queryFn: () => axios.get(`http://localhost:5000/api/journals/qr/${qrCode}`).then(res => res.data.data),
  });

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Spin size="large" /></div>;
  if (isError || !journal) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-2xl text-red-500 font-bold">Record Not Found</div>;

  const schema = journal.schemaId;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-12">
        <Card className="max-w-4xl mx-auto shadow-lg rounded-xl overflow-hidden" bodyStyle={{ padding: 0 }}>
            {/* Header Banner */}
            <div className="bg-green-600 text-white p-8 text-center">
                <Title level={2} className="!text-white !mb-2">EBookFarm Traceability</Title>
                <p className="opacity-90">Transparent Agricultural Product Information</p>
                <div className="mt-4 inline-block bg-white text-green-700 px-4 py-1 rounded-full font-bold">
                    ID: {journal.qrCode}
                </div>
            </div>

            <div className="p-8">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <Title level={3} className="!mb-1">Product: {schema.name}</Title>
                        <p className="text-gray-500">Producer: {journal.userId?.username}</p>
                    </div>
                    <Tag color={journal.status === 'Completed' ? 'success' : 'warning'}>{journal.status}</Tag>
                </div>

                <div className="mb-10">
                   <Title level={4}>Production Timeline</Title>
                   <Steps
                      direction="vertical"
                      current={schema.tables.length}
                      items={schema.tables.map((table) => ({
                          title: table.tableName,
                          description: (
                              <div className="bg-gray-50 p-4 rounded-md mt-2 mb-4">
                                  <Descriptions size="small" column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}>
                                      {table.fields.map((field) => (
                                          <Descriptions.Item label={field.label} key={field.name}>
                                              {journal.entries?.[table.tableName]?.[field.name] || 'N/A'}
                                          </Descriptions.Item>
                                      ))}
                                  </Descriptions>
                              </div>
                          )
                      }))}
                   />
                </div>
            </div>
        </Card>
    </div>
  );
};

export default JournalTrace;
